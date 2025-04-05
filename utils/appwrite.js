import { Client, Account, ID,Databases,Permission, Role, OAuthProvider, Query, Storage } from "react-native-appwrite";
import * as SecureStore from "expo-secure-store";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67dbfc74001bbb9335a9");

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

const SESSION_KEY = "user_session"; 
const DATABASE_ID="67dfb11f000d20bf0878";
const COLLECTION_ID="67dfb12e0002895ef8d3"
const PLANNER_COLLECTION_ID = "67efc1b000388393c477";
const STUDY_SESSION_COLLECTION_ID = "67f009270007cb4e95d1"; // Replace with your actual collection ID
const VIDEOS_COLLECTION_ID = "67f0a2ad003681a8f3c3"; // Create this collection in Appwrite dashboard
const STORAGE_BUCKET_ID = "67f0a23f002cbbbdc33d"; // Create this bucket in Appwrite dashboard

//  Get stored session
export const getSession = async () => {
  try {
    const storedSession = await SecureStore.getItemAsync(SESSION_KEY);
    if (storedSession) {
      return JSON.parse(storedSession);
    }
    const session = await account.get();
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    return session;
  } catch (error) {
    return null;
  }
};

//  Email & Password Login
export const login = async (email, password) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    return session;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

//  Google OAuth Login
export const loginWithGoogle = async (provider) => {
  try {
    const deepLink = new URL(makeRedirectUri({ preferLocalhost: true }));
    if (!deepLink.hostname) {
        deepLink.hostname = "localhost";
    }
    const scheme = `${deepLink.protocol}//`; // e.g., 'exp://', 'padhai://'
    const authprovider=provider
    const loginUrl = account.createOAuth2Token(OAuthProvider.Google, `${deepLink}`, `${deepLink}`
    );
    const result = await WebBrowser.openAuthSessionAsync(`${loginUrl}`, scheme);
    // await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(loginUrl));
    if (result.type === "success" && result.url) {
        const url = new URL(result.url);
        const secret = url.searchParams.get("secret");
        const userId = url.searchParams.get("userId");
        const session = await account.createSession(userId,secret);
        await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
        console.log("✅ Google Sign-in Successful. Stored Session:", session);
       
    } else {
        console.error("❌ OAuth failed or was canceled.");
    } 
    return result;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

// Logout (Remove stored session)
export const logout = async () => {
  try {
    await account.deleteSession("current");
    await SecureStore.deleteItemAsync(SESSION_KEY);
  } catch (error) {
    console.error("Logout Error:", error);
    throw error;
  }
};

export const signUp = async (email, password) => {
  try {
    const user = await account.create(ID.unique(), email, password);

    await databases.createDocument(DATABASE_ID, COLLECTION_ID, user.$id, {
      email: user.email, 
      createdAt: user.$createdAt,
      verified: user.emailVerification
    }, [
      Permission.read(Role.any()),       // Allow anyone to read initially
      Permission.update(Role.guests()),  // Guests can update (change later)
      Permission.delete(Role.guests())  
  ]);

    return { success: true, message: "Account created successfully. Please log in." };
  } catch (error) {
    if (error.code === 409) {
      return { success: false, message: "User already exists. Please log in." };
    }
    else{

      return { success: false, message: `Signup failed.${error}` };
    }
  }
};

export const getCurrentUser = async () => {
    try {
        return await account.get();
    } catch {
        return null; // User not logged in
    }
};

// Add this function to handle planner operations
export const savePlanner = async (userId, plannerData) => {
  try {
    // Check if user already has a planner
    const existingPlanner = await getUserPlanner(userId);
    
    if (existingPlanner) {
      // Get current planner count
      const plannerCount = existingPlanner.plannerCount || 1;
      
      // Check if we're at the limit
      if (plannerCount >= 2) {
        throw new Error("Maximum planner limit reached");
      }
      
      // Update existing planner
      const response = await databases.updateDocument(
        DATABASE_ID,
        PLANNER_COLLECTION_ID,
        existingPlanner.$id,
        {
          plannerData: JSON.stringify(plannerData),
          plannerCount: plannerCount + 1,
          updatedAt: new Date().toISOString(),
        }
      );
      return response;
    } else {
      // Create new planner with more permissive permissions
      const response = await databases.createDocument(
        DATABASE_ID,
        PLANNER_COLLECTION_ID,
        ID.unique(),
        {
          userId: userId,
          plannerData: JSON.stringify(plannerData),
          plannerCount: 1,
          createdAt: new Date().toISOString(),
        },
        [
          Permission.read(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ]
      );
      return response;
    }
  } catch (error) {
    console.error("Error saving planner:", error);
    throw error;
  }
};

export const getUserPlanner = async (userId) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      PLANNER_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.orderDesc("createdAt"),
        Query.limit(1),
      ]
    );
    return response.documents[0] || null;
  } catch (error) {
    console.error("Error fetching planner:", error);
    return null;
  }
};

// Add this function to save study sessions
export const saveStudySession = async (sessionData) => {
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      STUDY_SESSION_COLLECTION_ID,
      ID.unique(),
      {
        userId: sessionData.userId,
        subject: sessionData.subject,
        topic: sessionData.topic,
        taskId: sessionData.taskId,
        timeSlot: sessionData.timeSlot,
        duration: sessionData.duration,
        studyTime: sessionData.studyTime,
        pauseCount: sessionData.pauseCount,
        completed: sessionData.completed,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        createdAt: new Date().toISOString(),
      },
      [
        Permission.read(Role.user(sessionData.userId)),
        Permission.update(Role.user(sessionData.userId)),
        Permission.delete(Role.user(sessionData.userId))
      ]
    );
    return response;
  } catch (error) {
    console.error("Error saving study session:", error);
    throw error;
  }
};

// Add this function to get user's study sessions
export const getUserStudySessions = async (userId) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      STUDY_SESSION_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.orderDesc("createdAt"),
      ]
    );
    return response.documents;
  } catch (error) {
    console.error("Error fetching study sessions:", error);
    return [];
  }
};

// Video related functions
export const uploadVideo = async (userId, videoUri, description, subject) => {
  try {
    console.log("UPLOAD START: User ID:", userId);
    console.log("UPLOAD: Video URI:", videoUri);
    
    // Check if user is authenticated
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // First check if file exists
    try {
      console.log("UPLOAD: Checking if file exists...");
      const fileCheck = await fetch(videoUri, { method: 'HEAD' });
      console.log("UPLOAD: File exists, status:", fileCheck.status);
    } catch (error) {
      console.error("UPLOAD ERROR: File check failed:", error);
      throw new Error("Video file not found or inaccessible");
    }

    // Extract filename from URI
    const filename = videoUri.split('/').pop() || 'video.mp4';
    console.log("UPLOAD: Extracted filename:", filename);
    
    try {
      // Generate a unique ID for the file
      const fileId = ID.unique();
      console.log("UPLOAD: Generated file ID:", fileId);
      
      // First create the database record
      console.log("UPLOAD: Creating database record...");
      const videoRecord = await databases.createDocument(
        DATABASE_ID,
        VIDEOS_COLLECTION_ID,
        ID.unique(),
        {
          userId: userId,
          fileId: fileId,
          description: description || "Educational video",
          subject: subject || "General",
          likes: 0,
          comments: 0,
          shares: 0,
          createdAt: new Date().toISOString(),
        },
        [
          Permission.read(Role.any()),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId))
        ]
      );
      
      console.log("UPLOAD: Video record created with ID:", videoRecord.$id);
      
      // Now try to upload the file directly
      console.log("UPLOAD: Beginning direct file upload...");
      
      try {
        // Use our new direct upload function
        const fileUpload = await uploadFileDirectly(videoUri, fileId);
        console.log("UPLOAD: File upload successful:", fileUpload);
        
        return videoRecord;
      } catch (fileError) {
        console.error("UPLOAD: File upload failed but record was created:", fileError);
        // Just return the record since it was created successfully
        return videoRecord;
      }
    } catch (processError) {
      console.error("UPLOAD ERROR: Processing error:", processError);
      
      // Provide more specific error messages
      if (processError.message?.includes("network")) {
        throw new Error("Network error during upload. Please check your connection.");
      } else if (processError.code === 413 || processError.message?.includes("size")) {
        throw new Error("Video file is too large. Maximum size is 50MB.");
      } else if (processError.code === 401) {
        throw new Error("Authentication error. Please log in again.");
      } else {
        throw new Error(`Failed to process video: ${processError.message}`);
      }
    }
  } catch (error) {
    console.error("UPLOAD ERROR: General error:", error);
    console.error("UPLOAD ERROR: Stack trace:", error.stack);
    throw error;
  }
};

// Get video file preview URL - Simplified and reliable
export const getVideoPreviewUrl = (fileId, fakeFileId = false) => {
  if (!fileId) {
    console.warn("Missing fileId in getVideoPreviewUrl");
    return null;
  }
  
  if (fakeFileId === true) {
    return "https://via.placeholder.com/400x600?text=Video+Processing";
  }
  
  try {
    // Get direct file view URL instead of preview
    const viewUrl = storage.getFileView(STORAGE_BUCKET_ID, fileId);
    console.log("Video URL generated:", viewUrl);
    return viewUrl;
  } catch (error) {
    console.error("Error getting video URL:", error);
    return null;
  }
};

// Get all videos for a specific user
export const getUserVideos = async (userId) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      VIDEOS_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.orderDesc("createdAt"),
      ]
    );
    
    return response.documents;
  } catch (error) {
    console.error("Error fetching user videos:", error);
    return [];
  }
};

// Get all public videos (for the feed)
export const getAllVideos = async (limit = 10) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      VIDEOS_COLLECTION_ID,
      [
        Query.orderDesc("createdAt"),
        Query.limit(limit),
      ]
    );
    
    // Process the videos to ensure we have valid URLs
    const processedVideos = response.documents.map(video => {
      try {
        // Check if we have a valid fileId
        if (!video.fileId) {
          console.warn("Video missing fileId:", video.$id);
          return {
            ...video,
            validVideo: false
          };
        }
        
        // Log the fileId to help diagnose issues
        console.log("Video fileId:", video.fileId, "for video:", video.$id);
        
        return {
          ...video,
          validVideo: true
        };
      } catch (error) {
        console.error("Error processing video:", video.$id, error);
        return {
          ...video,
          validVideo: false
        };
      }
    });
    
    return processedVideos;
  } catch (error) {
    console.error("Error fetching all videos:", error);
    return [];
  }
};

// Add a new simpler upload function for testing
export const uploadSimpleVideo = async (userId, videoUri, description, subject) => {
  try {
    console.log("SIMPLE UPLOAD: Starting with URI:", videoUri);
    
    // Check video file size with FileSystem if possible
    const filename = videoUri.split('/').pop() || 'video.mp4';
    const fileId = ID.unique();
    
    // For React Native, we need to use formData or file input
    // Try a direct approach without blob conversion
    console.log("SIMPLE UPLOAD: Creating file in storage...");
    
    // Use the storage SDK's built-in functionality
    const fileUploadResponse = await storage.createFile(
      STORAGE_BUCKET_ID,
      fileId,
      {
        type: 'application/octet-stream',
        uri: videoUri, // Direct URI usage
        name: filename,
      }
    );
    
    console.log("SIMPLE UPLOAD: File created successfully:", fileUploadResponse);
    
    // Create database record
    const videoRecord = await databases.createDocument(
      DATABASE_ID,
      VIDEOS_COLLECTION_ID,
      ID.unique(),
      {
        userId: userId,
        fileId: fileId, // Use the ID we generated
        description: description || "Educational video",
        subject: subject || "General",
        likes: 0,
        comments: 0,
        shares: 0,
        createdAt: new Date().toISOString(),
      }
    );
    
    console.log("SIMPLE UPLOAD: Video record created:", videoRecord);
    return videoRecord;
  } catch (error) {
    console.error("SIMPLE UPLOAD ERROR:", error);
    throw error;
  }
};

// Add a new direct upload function that bypasses the SDK for file upload
export const uploadDirectVideo = async (userId, videoUri, description, subject) => {
  try {
    console.log("DIRECT UPLOAD: Starting with URI:", videoUri);
    
    // Check if file exists and get info
    const filename = videoUri.split('/').pop() || 'video.mp4';
    const fileId = ID.unique();
    
    console.log("DIRECT UPLOAD: File ID:", fileId, "Filename:", filename);
    
    // Create the database entry first
    console.log("DIRECT UPLOAD: Creating database entry...");
    const videoRecord = await databases.createDocument(
      DATABASE_ID,
      VIDEOS_COLLECTION_ID,
      ID.unique(),
      {
        userId: userId,
        fileId: fileId, // Use the ID we generated
        description: description || "Educational video",
        subject: subject || "General",
        likes: 0,
        comments: 0,
        shares: 0,
        createdAt: new Date().toISOString(),
      },
      [
        Permission.read(Role.any()),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId))
      ]
    );
    
    console.log("DIRECT UPLOAD: Database entry created successfully:", videoRecord.$id);
    
    // Now we can use the API endpoint directly with fetch
    // This avoids using the SDK's file upload method which is failing
    try {
      console.log("DIRECT UPLOAD: Starting file upload via fetch...");
      
      // Get file data
      const fileData = await fetch(videoUri);
      const fileBlob = await fileData.blob();
      
      console.log("DIRECT UPLOAD: Got file blob, size:", fileBlob.size);
      
      // Directly use fetch API
      const formData = new FormData();
      formData.append('fileId', fileId);
      formData.append('file', fileBlob, filename);
      
      // Get current session for auth
      const session = await getSession();
      
      // Set up fetch request
      const uploadResponse = await fetch(
        `https://cloud.appwrite.io/v1/storage/buckets/${STORAGE_BUCKET_ID}/files`,
        {
          method: 'POST',
          headers: {
            'X-Appwrite-Project': client.config.project,
            'X-Appwrite-Session': session?.secret || '',
          },
          body: formData,
        }
      );
      
      if (!uploadResponse.ok) {
        console.error("DIRECT UPLOAD: Upload response not OK:", uploadResponse.status);
        throw new Error(`Upload failed with status ${uploadResponse.status}`);
      }
      
      const uploadResult = await uploadResponse.json();
      console.log("DIRECT UPLOAD: File upload successful:", uploadResult);
      
      // Return the video record we created earlier
      return videoRecord;
    } catch (uploadError) {
      console.error("DIRECT UPLOAD: File upload failed:", uploadError);
      
      // Since we already created the database entry, return it anyway
      // This isn't ideal but prevents the "undefined" errors
      console.log("DIRECT UPLOAD: Returning database record despite upload failure");
      return videoRecord;
    }
  } catch (error) {
    console.error("DIRECT UPLOAD: General error:", error);
    throw error;
  }
};

// Add a fallback function that only creates a DB entry without trying to upload the file
export const createVideoRecordOnly = async (userId, videoUri, description, subject) => {
  try {
    console.log("FALLBACK: Creating database-only record");
    
    // Generate a unique file ID
    const fileId = ID.unique();
    const recordId = ID.unique();
    
    // Extract filename from URI for reference
    const filename = videoUri.split('/').pop() || 'video.mp4';
    
    console.log("FALLBACK: Creating video record with ID:", recordId);
    
    // Create the database entry without attempting file upload
    const videoRecord = await databases.createDocument(
      DATABASE_ID,
      VIDEOS_COLLECTION_ID,
      recordId,
      {
        userId: userId,
        fileId: fileId, // This file doesn't exist yet in storage
        fakeFileId: true, // Flag this as a record without a real file
        pendingUpload: true,
        videoFileName: filename,
        videoUri: videoUri, // Store the local URI for possible later upload
        description: description || "Educational video",
        subject: subject || "General",
        likes: 0,
        comments: 0,
        shares: 0,
        createdAt: new Date().toISOString(),
      },
      [
        Permission.read(Role.any()),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId))
      ]
    );
    
    console.log("FALLBACK: Database entry created successfully:", videoRecord.$id);
    return videoRecord;
  } catch (error) {
    console.error("FALLBACK ERROR:", error);
    throw error;
  }
};

// Simplest possible video record creation with enhanced error handling
export const createMinimalVideoRecord = async (userId, description, subject) => {
  try {
    console.log("MINIMAL: Creating simplified video record for user", userId);
    
    // Generate a unique IDs
    const fileId = ID.unique();
    const recordId = ID.unique();
    
    // Log all parameters 
    console.log("MINIMAL: Parameters:", {
      DATABASE_ID,
      VIDEOS_COLLECTION_ID,
      recordId,
      userId,
      fileId,
      description,
      subject
    });
    
    try {
      // First check if the collection exists
      console.log("MINIMAL: Checking database connection...");
      await databases.listDocuments(DATABASE_ID, VIDEOS_COLLECTION_ID, [Query.limit(1)]);
      console.log("MINIMAL: Database connection successful");
    } catch (dbError) {
      console.error("MINIMAL ERROR: Database connection failed:", dbError);
      throw new Error(`Database connection failed: ${dbError.message}`);
    }
    
    // Create a minimal database entry with default permissions
    console.log("MINIMAL: Creating database document...");
    try {
      const videoRecord = await databases.createDocument(
        DATABASE_ID,
        VIDEOS_COLLECTION_ID,
        recordId,
        {
          userId: userId,
          fileId: fileId,
          dummyFile: true,
          description: description || "Educational video",
          subject: subject || "General",
          likes: 0,
          comments: 0,
          shares: 0,
          createdAt: new Date().toISOString(),
        }
      );
      
      console.log("MINIMAL: Document created successfully:", videoRecord);
      return videoRecord;
    } catch (createError) {
      // Provide detailed error info
      console.error("MINIMAL ERROR: Document creation failed:", createError);
      console.error("MINIMAL ERROR: Error code:", createError.code);
      console.error("MINIMAL ERROR: Error message:", createError.message);
      
      if (createError.code === 401) {
        throw new Error("Authentication error: Please log in again");
      } else if (createError.code === 403) {
        throw new Error("Permission denied: You don't have permission to create records");
      } else if (createError.code === 404) {
        throw new Error("Collection not found: The videos collection might not be set up correctly");
      } else {
        throw new Error(`Database error (${createError.code}): ${createError.message}`);
      }
    }
  } catch (error) {
    console.error("MINIMAL CRITICAL ERROR:", error);
    throw error;
  }
};

// Create simple video post without attempting any file upload
export const createVideoPostOnly = async (userId, description, subject) => {
  try {
    console.log("=== VIDEO POST CREATION ===");
    console.log("Creating video post for user:", userId);
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    // Generate unique identifiers
    const dummyFileId = ID.unique();
    const recordId = ID.unique();
    
    // Make sure description and subject have valid values
    const safeDescription = description || "Educational video";
    const safeSubject = subject || "General";
    
    console.log("Creating video record in database...");
    console.log("Database ID:", DATABASE_ID);
    console.log("Collection ID:", VIDEOS_COLLECTION_ID);
    
    // Create a video record with a dummy fileId
    const videoData = {
      userId: userId,
      fileId: dummyFileId,
      placeholderMode: true,
      description: safeDescription,
      subject: safeSubject,
      likes: 0,
      comments: 0,
      shares: 0,
      status: "placeholder",
      createdAt: new Date().toISOString(),
    };
    
    // Create the document with basic permissions that should work
    const videoRecord = await databases.createDocument(
      DATABASE_ID,
      VIDEOS_COLLECTION_ID,
      recordId,
      videoData
    );
    
    console.log("Video record created successfully:", videoRecord.$id);
    
    return {
      ...videoRecord,
      isPlaceholder: true,
    };
  } catch (error) {
    console.error("Error creating video post:", error);
    if (error.code === 401) {
      throw new Error("Authentication error - please log in again");
    } else if (error.code === 404) {
      throw new Error("Database or collection not found - check your Appwrite setup");
    } else {
      throw new Error(`Failed to create video post: ${error.message}`);
    }
  }
};

// Direct file upload function without using SDK's storage methods
export const uploadFileDirectly = async (fileUri, fileId, bucketId) => {
  console.log("DIRECT UPLOAD: Starting direct file upload");
  console.log("DIRECT UPLOAD: File URI:", fileUri);
  console.log("DIRECT UPLOAD: File ID:", fileId);
  
  // Default to the app's storage bucket if not provided
  const targetBucket = bucketId || STORAGE_BUCKET_ID;
  
  try {
    // Get session for authentication - this is critical
    const session = await getSession();
    console.log("DIRECT UPLOAD: Session retrieved:", session ? "Yes" : "No");
    
    // Check if we have a valid session
    if (!session || !session.secret) {
      console.log("DIRECT UPLOAD: No valid session found, attempting to refresh");
      
      try {
        // Try to get the current account as a fallback
        const currentAccount = await account.get();
        console.log("DIRECT UPLOAD: Current account retrieved:", currentAccount ? currentAccount.$id : "No");
      } catch (authError) {
        console.error("DIRECT UPLOAD: Failed to refresh auth:", authError);
        throw new Error("Authentication failed - please log in again");
      }
    }
    
    // Extract necessary info
    const filename = fileUri.split('/').pop() || 'file.mp4';
    
    console.log("DIRECT UPLOAD: Using SDK storage directly");
    
    try {
      // First try the SDK's storage.createFile directly
      const response = await fetch(fileUri);
      const blob = await response.blob();
      
      console.log("DIRECT UPLOAD: Blob created, size:", blob.size);
      
      // Use SDK to create file
      const fileResponse = await storage.createFile(
        targetBucket,
        fileId,
        blob,
        filename
      );
      
      console.log("DIRECT UPLOAD: SDK file upload successful:", fileResponse ? fileResponse.$id : "Unknown");
      return fileResponse;
    } catch (sdkError) {
      console.error("DIRECT UPLOAD: SDK upload failed:", sdkError);
      
      // If SDK method fails, try with FormData as fallback
      console.log("DIRECT UPLOAD: Trying FormData approach as fallback");
      
      // Create FormData object
      const formData = new FormData();
      
      // Append the file
      formData.append('fileId', fileId);
      formData.append('file', {
        uri: fileUri,
        name: filename,
        type: 'video/mp4',
      });
      
      // Get the API endpoint and project ID
      const apiUrl = `https://cloud.appwrite.io/v1/storage/buckets/${targetBucket}/files`;
      const projectId = client.config.project;
      
      // Try to get a JWT token instead of session
      let headers = {
        'X-Appwrite-Project': projectId,
      };
      
      try {
        // Create a JWT for auth
        const jwt = await account.createJWT();
        if (jwt && jwt.jwt) {
          console.log("DIRECT UPLOAD: Created JWT for auth");
          headers['X-Appwrite-JWT'] = jwt.jwt;
        } else if (session && session.secret) {
          console.log("DIRECT UPLOAD: Using session for auth");
          headers['X-Appwrite-Session'] = session.secret;
        }
      } catch (jwtError) {
        console.log("DIRECT UPLOAD: Failed to create JWT, using session:", session ? "Yes" : "No");
        if (session && session.secret) {
          headers['X-Appwrite-Session'] = session.secret;
        }
      }
      
      console.log("DIRECT UPLOAD: Making fetch request to:", apiUrl);
      
      // Make the request
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: formData
      });
      
      // Check the response
      if (!response.ok) {
        const errorText = await response.text();
        console.error("DIRECT UPLOAD: Upload failed with status:", response.status);
        console.error("DIRECT UPLOAD: Error details:", errorText);
        throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log("DIRECT UPLOAD: Success! File uploaded with ID:", result.$id);
      
      return result;
    }
  } catch (error) {
    console.error("DIRECT UPLOAD: Error during upload:", error);
    throw error;
  }
};

// Function to retry a file upload for an existing video record
export const retryFileUpload = async (videoRecord, fileUri) => {
  try {
    console.log("RETRY UPLOAD: Starting for video record:", videoRecord.$id);
    console.log("RETRY UPLOAD: File URI:", fileUri);
    
    if (!videoRecord.fileId) {
      console.error("RETRY UPLOAD: No fileId in video record");
      throw new Error("Invalid video record: missing fileId");
    }
    
    // Check if user is authenticated first
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        console.error("RETRY UPLOAD: User not authenticated");
        throw new Error("Please log in to retry upload");
      }
      console.log("RETRY UPLOAD: User authenticated:", currentUser.$id);
    } catch (authError) {
      console.error("RETRY UPLOAD: Auth check failed:", authError);
      throw new Error("Authentication error - please log in again");
    }
    
    // Attempt the direct upload with updated function
    console.log("RETRY UPLOAD: Calling direct upload function");
    const uploadResult = await uploadFileDirectly(fileUri, videoRecord.fileId);
    
    console.log("RETRY UPLOAD: Success!", uploadResult);
    return {
      success: true,
      fileId: uploadResult.$id,
      videoId: videoRecord.$id
    };
  } catch (error) {
    console.error("RETRY UPLOAD: Failed:", error);
    return {
      success: false,
      error: error.message || "Unknown upload error",
      videoId: videoRecord.$id
    };
  }
};

// Simplified direct upload function
export const uploadSimpleDirect = async (userId, fileUri) => {
  console.log("SIMPLE UPLOAD: Starting with simple approach");
  console.log("SIMPLE UPLOAD: User ID:", userId);
  console.log("SIMPLE UPLOAD: File URI:", fileUri);
  
  if (!userId) {
    throw new Error("User ID is required for upload");
  }
  
  try {
    // 1. First create a database record that we can reference even if file upload fails
    const recordId = ID.unique();
    const fileId = ID.unique();
    const filename = fileUri.split('/').pop() || 'video.mp4';
    
    console.log("SIMPLE UPLOAD: Creating database record with ID:", recordId);
    console.log("SIMPLE UPLOAD: Using file ID:", fileId);
    
    // Create database record
    const videoRecord = await databases.createDocument(
      DATABASE_ID,
      VIDEOS_COLLECTION_ID,
      recordId,
      {
        userId: userId,
        fileId: fileId,
        videoUri: fileUri, // Store the original URI for potential retry
        filename: filename,
        description: "Educational video",
        subject: "General",
        likes: 0,
        comments: 0, 
        shares: 0,
        createdAt: new Date().toISOString(),
      }
    );
    
    console.log("SIMPLE UPLOAD: Database record created successfully");
    
    // 2. Now try to upload the actual file - even if this fails, we have the record
    try {
      console.log("SIMPLE UPLOAD: Initializing file upload");
      
      // Just use the storage API directly with minimal parameters
      await storage.createFile(
        STORAGE_BUCKET_ID,
        fileId,
        fileUri  // Pass the file URI directly
      );
      
      console.log("SIMPLE UPLOAD: File upload successful!");
      
      return {
        success: true,
        videoRecord: videoRecord,
        fileId: fileId,
        fileUploaded: true
      };
    } catch (fileError) {
      console.error("SIMPLE UPLOAD: File upload failed:", fileError);
      
      // Return the record even if file upload failed
      return {
        success: true,
        videoRecord: videoRecord,
        fileId: fileId,
        fileUploaded: false,
        fileError: fileError.message
      };
    }
  } catch (error) {
    console.error("SIMPLE UPLOAD: Critical error:", error);
    throw error;
  }
};

// Most basic possible approach - upload directly as a blob with SDK
export const uploadBlobDirect = async (userId, fileUri) => {
  console.log("BLOB UPLOAD: Starting with blob approach");
  console.log("BLOB UPLOAD: File URI:", fileUri);
  
  try {
    // Create database and file IDs
    const recordId = ID.unique();
    const fileId = ID.unique();
    
    // First create the database record
    const videoRecord = await databases.createDocument(
      DATABASE_ID,
      VIDEOS_COLLECTION_ID,
      recordId,
      {
        userId: userId,
        fileId: fileId,
        videoUri: fileUri,
        description: "Educational video",
        subject: "General",
        likes: 0,
        comments: 0,
        shares: 0,
        createdAt: new Date().toISOString()
      }
    );
    
    console.log("BLOB UPLOAD: Database record created:", videoRecord.$id);
    
    try {
      // Fetch the file as a blob
      const response = await fetch(fileUri);
      console.log("BLOB UPLOAD: File fetched, status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
      }
      
      const blob = await response.blob();
      console.log("BLOB UPLOAD: Blob created, size:", blob.size);
      
      // Upload the blob directly with minimal parameters
      const fileResponse = await storage.createFile(
        STORAGE_BUCKET_ID,
        fileId,
        blob
      );
      
      console.log("BLOB UPLOAD: File uploaded successfully:", fileResponse.$id);
      
      return {
        success: true,
        videoRecord: videoRecord,
        fileUploaded: true
      };
    } catch (fileError) {
      console.error("BLOB UPLOAD: File upload failed:", fileError);
      console.error("BLOB UPLOAD: Error details:", fileError.message);
      
      // Return success with the record even if file failed
      return {
        success: true,
        videoRecord: videoRecord,
        fileUploaded: false,
        error: fileError.message
      };
    }
  } catch (error) {
    console.error("BLOB UPLOAD: Critical error:", error);
    throw error;
  }
};

// Function to fetch reels with preview URLs
export const fetchReels = async () => {
  try {
    console.log("Fetching reels from database...");
    const res = await databases.listDocuments(DATABASE_ID, VIDEOS_COLLECTION_ID, [
      // Order by time - newest first
      Query.orderDesc("createdAt")
    ]);

    console.log(`Found ${res.documents.length} reels`);

    const videoData = await Promise.all(
      res.documents.map(async (doc) => {
        try {
          // Use the existing getVideoPreviewUrl function to get preview URLs
          const previewUrl = getVideoPreviewUrl(doc.fileId);
          return { 
            ...doc, 
            previewUrl: previewUrl,
            // Flag to indicate if the preview is available
            hasPreview: !!previewUrl
          };
        } catch (error) {
          console.error(`Error getting preview for video ${doc.$id}:`, error);
          return { 
            ...doc, 
            previewUrl: null,
            hasPreview: false,
            error: error.message
          };
        }
      })
    );

    return videoData;
  } catch (error) {
    console.error("Error fetching reels:", error);
    return [];
  }
};

export default client;
