"use client";

import { useEffect, useState } from "react";
import { Bell, Download, X, Check, Smartphone, Sparkles, Share, Plus } from "lucide-react";
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
  const [showIosGuide, setShowIosGuide] = useState(false);

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
      
      // Auto-show banner if not standalone and not dismissed
      const dismissed = localStorage.getItem("pwa_prompt_dismissed");
      if (!dismissed && !standaloneMode) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If running in standalone mode (already installed), show push subscription prompt if not already subscribed
    if (standaloneMode) {
      setIsInstallable(false);
      // Wait for a few seconds before prompting for push subscription inside the PWA
      const promptDismissed = localStorage.getItem("push_prompt_dismissed");
      if (!promptDismissed) {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    } else {
      // If NOT installed, show PWA install prompt after 4 seconds on mobile devices
      const dismissed = localStorage.getItem("pwa_prompt_dismissed");
      if (!dismissed) {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 4000);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    if (isStandalone) {
      localStorage.setItem("push_prompt_dismissed", "true");
    } else {
      localStorage.setItem("pwa_prompt_dismissed", "true");
    }
  };

  const handleSubscribe = async () => {
    if (!swRegistration || !VAPID_PUBLIC_KEY) {
      alert("Push notifications are not fully supported on this browser/device, or VAPID keys are missing.");
      return;
    }

    setIsPending(true);
    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
      
      if (permission !== "granted") {
        throw new Error("Permission not granted for notifications");
      }

      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription }),
      });

      if (!res.ok) throw new Error("Failed to register subscription on server");

      setIsSubscribed(true);
      
      // Auto close after success
      setTimeout(() => {
        setIsVisible(false);
      }, 2000);

    } catch (err) {
      console.error("Subscription process failed:", err);
      alert("Failed to subscribe. Please check your browser's notification permissions.");
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
        setIsVisible(false);
      }
    } catch (err) {
      console.error("PWA install failed:", err);
    } finally {
      setIsPending(false);
    }
  };

  // Hide component if visible is false, or both conditions are satisfied
  if (!isVisible) return null;
  if (!isStandalone && isSubscribed) {
    // If we aren't standalone, we should only be prompting for installation. If already subscribed somehow, but not installed, we can still prompt to install.
  }
  if (isStandalone && isSubscribed) return null;

  return (
    <>
      {/* Floating Prompt Widget */}
      <div className="fixed bottom-6 left-6 z-[9999] max-w-[360px] w-[calc(100vw-48px)] bg-white/95 backdrop-blur-xl border border-[#F1D9D0] rounded-3xl p-5 shadow-[0_20px_50px_rgba(128,15,45,0.12)] animate-in slide-in-from-bottom-8 fade-in duration-300">
        {/* Header */}
        <div className="flex justify-between items-start gap-4 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#FFF0F4] text-[#FF4A7D] flex items-center justify-center font-bold shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-[#800F2D] leading-tight">
                {isStandalone ? "Enable Travel Alerts" : "Install TripNaari App"}
              </h4>
              <p className="text-[10px] text-[#13253D]/65 mt-0.5">
                {isStandalone ? "Safety & Tour Drops Live" : "Fast & safe women-only travel"}
              </p>
            </div>
          </div>
          <button 
            onClick={handleDismiss} 
            className="p-1 rounded-full text-[#13253D]/40 hover:bg-[#FFF0F4] hover:text-[#FF4A7D] transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content & Actions */}
        {isStandalone ? (
          /* Case A: App is already installed (Standalone Mode) -> Prompt for push subscriptions */
          <div className="space-y-3.5">
            <p className="text-xs text-[#13253D]/90 leading-relaxed">
              Enable real-time safety alerts, sudden schedule updates, and upcoming group tour departure drops directly on your device.
            </p>
            <Button 
              onClick={handleSubscribe} 
              isLoading={isPending}
              variant="primary" 
              size="sm" 
              className="w-full justify-center gap-2 font-semibold text-xs shadow-md"
            >
              <Bell className="w-4.5 h-4.5" /> Subscribe to Safety Alerts
            </Button>
          </div>
        ) : (
          /* Case B: App is NOT installed -> Prompt for PWA installation */
          <div className="space-y-3.5">
            <p className="text-xs text-[#13253D]/90 leading-relaxed">
              Save TripNaari on your homescreen for instant booking reviews, community alerts, and full offline safety logs.
            </p>

            {isIOS ? (
              /* iOS PWA Installation Button (Triggers Share-guide overlay) */
              <Button 
                onClick={() => setShowIosGuide(true)}
                variant="cream" 
                size="sm" 
                className="w-full justify-center gap-2 text-xs border border-[#F1D9D0] bg-[#FFF8F0] hover:bg-white text-[#800F2D] font-bold"
              >
                <Download className="w-4.5 h-4.5 text-[#FF4A7D]" /> Install on iPhone
              </Button>
            ) : (
              /* Chrome/Android Native PWA Installation Trigger */
              <Button 
                onClick={handleInstall} 
                isLoading={isPending}
                variant="cream" 
                size="sm" 
                className="w-full justify-center gap-2 text-xs border border-[#F1D9D0] bg-[#FFF8F0] hover:bg-white text-[#800F2D] font-bold"
              >
                <Download className="w-4.5 h-4.5 text-[#FF4A7D]" /> Install Homescreen App
              </Button>
            )}
          </div>
        )}
      </div>

      {/* iOS Step-by-Step Guided Overlay Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-end justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white border border-[#F1D9D0] rounded-[32px] p-6 max-w-[380px] w-full shadow-2xl relative mb-20 animate-in slide-in-from-bottom-12 duration-300">
            {/* Close */}
            <button 
              onClick={() => setShowIosGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#13253D]/50 hover:bg-[#FFF0F4] hover:text-[#FF4A7D] transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-2xl bg-[#FFF0F4] text-[#FF4A7D] flex items-center justify-center font-bold">
                <Smartphone className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-display font-extrabold text-base text-[#800F2D]">
                Add TripNaari to iPhone
              </h4>
            </div>

            {/* Guide Steps */}
            <div className="space-y-4 text-[12px] text-[#13253D]/90 leading-relaxed mb-6">
              <div className="flex gap-3.5 items-start bg-[#FFF8F0] p-3.5 rounded-2xl border border-[#F1D9D0]/50">
                <span className="w-6 h-6 rounded-full bg-white border border-[#F1D9D0] flex items-center justify-center text-xs font-bold text-[#800F2D] shrink-0 mt-0.5">1</span>
                <div>
                  Tap the native Safari **Share** icon in the browser bar.
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#FF4A7D] font-bold">
                    <Share className="w-4 h-4 shrink-0 stroke-[2.5]" /> Located at bottom on iPhone, top on iPad
                  </div>
                </div>
              </div>

              <div className="flex gap-3.5 items-start bg-[#FFF8F0] p-3.5 rounded-2xl border border-[#F1D9D0]/50">
                <span className="w-6 h-6 rounded-full bg-white border border-[#F1D9D0] flex items-center justify-center text-xs font-bold text-[#800F2D] shrink-0 mt-0.5">2</span>
                <div>
                  Scroll down the share sheet menu and select **Add to Home Screen**.
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#FF4A7D] font-bold">
                    <Plus className="w-4 h-4 shrink-0 stroke-[2.5] bg-white border border-[#F1D9D0] rounded-md p-0.5" /> Look for the plus square option
                  </div>
                </div>
              </div>

              <div className="flex gap-3.5 items-start bg-[#FFF8F0] p-3.5 rounded-2xl border border-[#F1D9D0]/50">
                <span className="w-6 h-6 rounded-full bg-white border border-[#F1D9D0] flex items-center justify-center text-xs font-bold text-[#800F2D] shrink-0 mt-0.5">3</span>
                <div>
                  Launch the **TripNaari App** from your homescreen, and you will be prompted to enable push safety alerts instantly!
                </div>
              </div>
            </div>

            {/* Dismiss Button */}
            <Button
              onClick={() => setShowIosGuide(false)}
              className="w-full justify-center text-xs font-bold shadow-none"
              variant="primary"
            >
              Got it, let's do it!
            </Button>
          </div>
          
          {/* Visual Indicator pointing downwards (pointing to the center share sheet on iPhone Safari) */}
          <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[10001] flex flex-col items-center animate-bounce pointer-events-none hidden md:hidden sm:flex">
            <div className="bg-[#800F2D] text-white font-semibold text-[10px] px-3 py-1.5 rounded-full shadow-lg border border-white/20">
              Tap Share Button Below
            </div>
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#800F2D] mt-0.5" />
          </div>
        </div>
      )}
    </>
  );
}
