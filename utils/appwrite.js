import { Client, Account, ID } from "react-native-appwrite";
import * as SecureStore from "expo-secure-store";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67dbfc74001bbb9335a9");

const account = new Account(client);
const SESSION_KEY = "user_session"; // 🔐 Key for storing session

// ✅ Get stored session
export const getSession = async () => {
  try {
    const storedSession = await SecureStore.getItemAsync(SESSION_KEY);
    if (storedSession) {
      return JSON.parse(storedSession); // ✅ Return stored session
    }
    const session = await account.get(); // 🔄 Fetch fresh session
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session)); // ✅ Save persistently
    return session;
  } catch (error) {
    return null;
  }
};

// ✅ Email & Password Login
export const login = async (email, password) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session)); // 🔐 Save session
    return session;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

// ✅ Google OAuth Login
export const loginWithGoogle = async (provider) => {
  try {
    const deepLink = new URL(makeRedirectUri({ preferLocalhost: true }));
    if (!deepLink.hostname) {
        deepLink.hostname = "localhost";
    }
    const scheme = `${deepLink.protocol}//`; // e.g., 'exp://', 'padhai://'

    const loginUrl = account.createOAuth2Session(provider, `${deepLink}`, `${deepLink}`);
    const result = await WebBrowser.openAuthSessionAsync(`${loginUrl}`, scheme);
    
    if (result.type === "success" && result.url) {
        const url = new URL(result.url);
        const secret = url.searchParams.get("secret");
        const userId = url.searchParams.get("userId");

        await account.createSession(userId, secret);
       
       
    } else {
        console.error("❌ OAuth failed or was canceled.");
    } 
    return result;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

// ✅ Logout (Remove stored session)
export const logout = async () => {
  try {
    await account.deleteSession("current");
    await SecureStore.deleteItemAsync(SESSION_KEY); // ❌ Remove session
  } catch (error) {
    console.error("Logout Error:", error);
    throw error;
  }
};

export const signUp= async(email,password)=>{
    try {
        return await account.create(ID.unique(),email, password);
    }
    catch (error) {
        return error;
    }
}
export const getCurrentUser = async () => {
    try {
        return await account.get();
    } catch {
        return null; // User not logged in
    }
};
export default client;
