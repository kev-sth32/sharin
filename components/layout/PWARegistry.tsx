"use client";

import { useEffect, useState } from "react";
import { Bell, Download, X, Check, Smartphone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PWARegistry() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permissionState, setPermissionState] = useState<string>("default");
  const [isVisible, setIsVisible] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isPending, setIsPending] = useState(false);
  
  // Mobile Safari / iOS handling
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect iOS
    const userAgent = window.navigator.userAgent;
    const isDeviceIOS = /iPhone|iPad|iPod/i.test(userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isDeviceIOS);

    // Detect Standalone mode (added to homescreen)
    const standaloneMode = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone;
    setIsStandalone(!!standaloneMode);

    // 1. Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Worker registered successfully with scope:", reg.scope);
          setSwRegistration(reg);
          
          // Check if already subscribed
          return reg.pushManager.getSubscription();
        })
        .then((sub) => {
          if (sub) {
            setIsSubscribed(true);
          }
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err);
        });
    }

    // 2. Check notification permission
    if ("Notification" in window) {
      setPermissionState(Notification.permission);
    }

    // 3. Listen for PWA installation prompt (Chrome/Android)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Auto-show banner if not dismissed before
      const dismissed = localStorage.getItem("pwa_prompt_dismissed");
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If running in standalone mode, do not show install options
    if (standaloneMode) {
      setIsInstallable(false);
    }

    // Show banner after 4 seconds on mobile/phone screens if not dismissed
    const dismissed = localStorage.getItem("pwa_prompt_dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 4000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("pwa_prompt_dismissed", "true");
  };

  const handleSubscribe = async () => {
    if (!swRegistration || !VAPID_PUBLIC_KEY) {
      alert("Push notifications are not fully supported on this browser/device, or VAPID keys are missing.");
      return;
    }

    setIsPending(true);
    try {
      // Ask for permission
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
      
      if (permission !== "granted") {
        throw new Error("Permission not granted for notifications");
      }

      // Subscribe to Push
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Send to server
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription }),
      });

      if (!res.ok) throw new Error("Failed to register subscription on server");

      setIsSubscribed(true);
      
      // Close prompt after 2 seconds if not installable
      setTimeout(() => {
        if (!isInstallable && !isIOS) {
          setIsVisible(false);
        }
      }, 2000);

    } catch (err) {
      console.error("Subscription process failed:", err);
      alert("Failed to subscribe. Please verify your notification settings.");
    } finally {
      setIsPending(false);
    }
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    setIsPending(true);
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA installation outcome: ${outcome}`);
      
      if (outcome === "accepted") {
        setIsInstallable(false);
        setDeferredPrompt(null);
        if (isSubscribed || permissionState !== "default") {
          setIsVisible(false);
        }
      }
    } catch (err) {
      console.error("PWA install failed:", err);
    } finally {
      setIsPending(false);
    }
  };

  // Render nothing if banner is not active or features are satisfied
  if (!isVisible) return null;
  if (!isIOS && isSubscribed && !isInstallable) return null;
  if (isIOS && isStandalone && isSubscribed) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[9999] max-w-[360px] w-[calc(100vw-48px)] bg-white/90 backdrop-blur-xl border border-[#F1D9D0] rounded-3xl p-5 shadow-[0_20px_50px_rgba(128,15,45,0.12)] animate-in slide-in-from-bottom-8 fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF0F4] text-[#FF4A7D] flex items-center justify-center font-bold relative shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-[#800F2D] leading-tight">TripNaari Assistant</h4>
            <p className="text-[11px] text-[#13253D]/60 mt-0.5">Safety alerts & safe travels app</p>
          </div>
        </div>
        <button 
          onClick={handleDismiss} 
          className="p-1 rounded-full text-[#13253D]/40 hover:bg-[#FFF0F4] hover:text-[#FF4A7D] transition"
          aria-label="Dismiss prompt"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body text / iOS guide */}
      <div className="text-xs text-[#13253D] leading-relaxed mb-4">
        {isIOS && !isStandalone ? (
          <div className="space-y-2">
            <p>
              Install the **TripNaari App** on your iPhone for quick access and real-time safety alerts.
            </p>
            <div className="bg-[#FFF8F0] border border-[#F1D9D0] rounded-2xl p-3 text-[11px] text-[#800F2D] space-y-1.5 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-white border border-[#F1D9D0] flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                <span>Tap the share icon <span className="text-[14px]">📤</span> at the bottom of Safari.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-white border border-[#F1D9D0] flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                <span>Scroll down and select <strong>Add to Home Screen</strong> <span className="text-[14px]">➕</span>.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-white border border-[#F1D9D0] flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                <span>Launch it from your homescreen to enable safety alerts!</span>
              </div>
            </div>
          </div>
        ) : (
          <p>
            {!isSubscribed 
              ? "Subscribe to get real-time safety alerts, new women-only trip drops, and itinerary updates directly on your device." 
              : "Now install our lightweight app on your homescreen for instant booking access and offline support!"}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        {(!isIOS || isStandalone) && !isSubscribed && (
          <Button 
            onClick={handleSubscribe} 
            isLoading={isPending}
            variant="primary" 
            size="sm" 
            className="w-full justify-center gap-2 font-semibold text-xs shadow-md"
          >
            <Bell className="w-4 h-4" /> Enable Safety Alerts
          </Button>
        )}

        {isSubscribed && (
          <div className="flex items-center gap-2 px-3 py-2 bg-[#EEFDF4] border border-[#D1F7E1] text-[#117B43] rounded-2xl mb-1 text-[11px] font-medium">
            <Check className="w-3.5 h-3.5 shrink-0" /> Alerts Enabled Successfully!
          </div>
        )}

        {!isIOS && isInstallable && (
          <Button 
            onClick={handleInstall} 
            isLoading={isPending}
            variant="cream" 
            size="sm" 
            className="w-full justify-center gap-2 text-xs border border-[#F1D9D0] bg-[#FFF8F0] hover:bg-white text-[#800F2D] font-semibold"
          >
            <Download className="w-4 h-4" /> Install Homescreen App
          </Button>
        )}
      </div>
    </div>
  );
}
