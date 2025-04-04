import { Client, Account, ID,Databases,Permission, Role, OAuthProvider, Query } from "react-native-appwrite";
import * as SecureStore from "expo-secure-store";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67dbfc74001bbb9335a9");

const account = new Account(client);
const databases = new Databases(client);

const SESSION_KEY = "user_session"; 
const DATABASE_ID="67dfb11f000d20bf0878";
const COLLECTION_ID="67dfb12e0002895ef8d3"
const PLANNER_COLLECTION_ID = "67efc1b000388393c477";
const STUDY_SESSION_COLLECTION_ID = "67f009270007cb4e95d1"; // Replace with your actual collection ID

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

export default client;
