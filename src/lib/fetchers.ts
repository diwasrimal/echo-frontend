import { SERVER_URL } from "./constants";
import { Message, User } from "./types";
import { makePayload } from "./utils";

export function fetchUserInfo(
  userId: number,
  useCache: boolean = true,
): Promise<User> {
  const url = `${SERVER_URL}/api/users/${userId}`;
  const storageKey = `user-${userId}`;

  return new Promise<User>((resolve, reject) => {
    if (useCache) {
      const data = sessionStorage.getItem(storageKey);
      if (data !== null) {
        console.log(`Resolved ${url} from sessionStorage`);
        return resolve(JSON.parse(data) as User);
      }
    }
    fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    })
      .then((res) => makePayload(res))
      .then((payload) => {
        if (payload.ok) {
          console.log(`Fetched ${url} from server`);
          const user = payload.user as User;
          sessionStorage.setItem(storageKey, JSON.stringify(user));
          resolve(user);
        } else {
          throw payload.message || "Unknown error occurred";
        }
      })
      .catch((err) => reject(`error fetching ${url}: ${err}`));
  });
}

export function fetchChatPartners(useCache: boolean = true): Promise<User[]> {
  const url = `${SERVER_URL}/api/chat-partners`;
  const storageKey = `chatPartners`;
  return new Promise<User[]>((resolve, reject) => {
    if (useCache) {
      const data = sessionStorage.getItem(storageKey);
      if (data !== null) {
        console.log(`Resolved ${url} from sessionStorage`);
        return resolve(JSON.parse(data) as User[]);
      }
    }

    fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    })
      .then((res) => makePayload(res))
      .then((payload) => {
        if (payload.ok) {
          console.log(`Fetched ${url} from server`);
          const partners = (payload.partners || []) as User[];
          sessionStorage.setItem(storageKey, JSON.stringify(partners));
          resolve(partners);
        } else {
          throw payload.message || "Unknown error occurred";
        }
      })
      .catch((err) => reject(`error fetching ${url}: ${err}`));
  });
}

export async function fetchChatMessages(
  ourId: number,
  partnerId: number,
  useCache: boolean = true,
): Promise<Message[]> {
  const url = `${SERVER_URL}/api/messages/${partnerId}`;
  const storageKey = `messages-${partnerId}`;

  return new Promise<Message[]>((resolve, reject) => {
    if (useCache) {
      const data = sessionStorage.getItem(storageKey);
      if (data !== null) {
        console.log(`Resolved ${url} from sessionStorage`);
        return resolve(JSON.parse(data) as Message[]);
      }
    }

    fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    })
      .then((res) => makePayload(res))
      .then((payload) => {
        if (payload.ok) {
          console.log(`Fetched ${url} from server`);
          const msgs = (payload.messages || []) as Message[];
          sessionStorage.setItem(storageKey, JSON.stringify(msgs));
          resolve(msgs);
        } else {
          throw payload.message || "Unknown error occurred"; // this one is error message
        }
      })
      .catch((err) => reject(`error fetching ${url}: ${err}`));
  });
}

export async function fetchUser(
  id: number,
  useCache: boolean = true,
): Promise<User> {
  const url = `${SERVER_URL}/api/users/${id}`;
  const storageKey = `user-${id}`;

  return new Promise<User>((resolve, reject) => {
    if (useCache) {
      const data = sessionStorage.getItem(storageKey);
      if (data !== null) {
        console.log(`Resolved ${url} from sessionStorage`);
        return resolve(JSON.parse(data) as User);
      }
    }

    fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
    })
      .then((res) => makePayload(res))
      .then((payload) => {
        if (payload.ok) {
          console.log(`Fetched ${url} from server`);
          const user = payload.user as User;
          sessionStorage.setItem(storageKey, JSON.stringify(user));
          resolve(user);
        } else {
          throw payload.message || "Unknown error occurred"; // this one is error message
        }
      })
      .catch((err) => reject(`Error fetching ${url}: ${err}`));
  });
}
