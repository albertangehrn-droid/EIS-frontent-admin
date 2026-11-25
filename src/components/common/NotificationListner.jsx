"use client";

// Notification Listener - Add your notification logic here
export default function NotificationListener() {
  // Add your custom notification implementation
  return null;
}



// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { messaging, onMessage } from "@/services/firebase";
// import { showToast } from "@/components/_ui/toast-utils";

// export default function NotificationListener() {
//   const router = useRouter();

//   useEffect(() => {
//     if (!messaging) {
//       console.warn("Firebase messaging not initialized.");
//       return;
//     }

//     const unsubscribe = onMessage(messaging, (payload) => {
//       console.log("📥 Foreground Message:", payload);
//       console.log("data keys:", Object.keys(payload.data || {}));
//       console.log("NotificationPath value:", payload.data?.NotificationPath);


//       const { title, body } = payload.notification || {};
//       const data = payload.data || {};

//       const image = data.image || "/favicon.ico";
//       const path = data.NotificationPath; 
//       const click_action = data.click_action;

//       if (!title || !body) return;

//       if (Notification.permission === "granted") {
//         try {
//           const notification = new Notification(title, {
//             body,
//             icon: image,
//           });

//           notification.onclick = (event) => {
//             event.preventDefault();
//             notification.close();

//             // ✅ Navigate internally (Next.js)
//             if (path) {
//               window.location.href = path; // router.push might not work from native Notification context
//             } else if (click_action) {
//               window.open(click_action, "_blank");
//             }
//           };
//         } catch (err) {
//           console.error("Notification error:", err);
//         }
//       } else {
//         // If notifications are blocked, show toast and still navigate if possible
//         showToast("success", body);

//         if (path) {
//           router.push(path);
//         }
//       }
//     });

//     return () => {
//       unsubscribe();
//     };
//   }, [router]);

//   return null;
// }
