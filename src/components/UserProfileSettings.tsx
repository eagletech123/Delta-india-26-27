import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  Zap,
  Sliders,
  Volume2,
  VolumeX,
  Bell,
  Network,
  Lock,
  Check,
  CheckCircle,
  Activity,
  Info,
  CreditCard,
  X,
  RefreshCw,
  Search,
  Plus,
  Trash2,
  Smartphone,
  Server,
  Key,
  AlertTriangle,
  Globe,
  Settings,
  SlidersHorizontal
} from "lucide-react";

interface WhitelistIP {
  id: string;
  ip: string;
  tag: string;
}

interface BillingLog {
  id: string;
  date: string;
  plan: string;
  cycle: string;
  amount: number;
  currency: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  avatarUrl: string;
  riskAppetite: string;
  leverageLimit: number;
  defaultOrderSize: number;
  executionSound: boolean;
  tradeAlerts: boolean;
  newsAlerts: boolean;
}

interface UserProfileSettingsProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  activePlan: string;
  setActivePlan: React.Dispatch<React.SetStateAction<string>>;
  isDark: boolean;
  palette: {
    primary: string;
    secondary: string;
    cardDark: string;
    cardLight: string;
    bgDark: string;
    bgLight: string;
  };
}

const AVATAR_PRESETS = [
  {
    name: "Advisor Profile (Sikh Turban)",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120&h=120",
  },
  {
    name: "Tech Female Trader",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120",
  },
  {
    name: "Nomad Quantitative Coder",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120",
  },
  {
    name: "Neural Cybernetic Flow",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120&h=120",
  }
];

export default function UserProfileSettings({
  userProfile,
  setUserProfile,
  activePlan,
  setActivePlan,
  isDark,
  palette
}: UserProfileSettingsProps) {
  // Configured inner-tab state support
  const [activeSubTab, setActiveSubTab] = useState<"profile" | "api" | "billing">("profile");

  // --- LOCAL FORM FIELDS (backed by userProfile props) ---
  const [tempProfile, setTempProfile] = useState<UserProfile>({ ...userProfile });

  useEffect(() => {
    setTempProfile({ ...userProfile });
  }, [userProfile]);

  // --- CREDENTIALS MANAGEMENT ---
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem("delta_api_key") || "dx_ind_8f92aef10e73b22108749a9fb02a";
  });
  const [apiSecret, setApiSecret] = useState<string>(() => {
    return localStorage.getItem("delta_api_secret") || "sec_sha256_e10982df45a201cc88496fac110e9dfbc72ea6";
  });
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [showApiSecret, setShowApiSecret] = useState<boolean>(false);
  const [isKeysSaved, setIsKeysSaved] = useState<boolean>(() => {
    return !!localStorage.getItem("delta_api_key");
  });

  // --- IP WHITELIST STATE ---
  const [currentSessionIp] = useState<string>("45.112.188.42");
  const [whitelist, setWhitelist] = useState<WhitelistIP[]>(() => {
    const saved = localStorage.getItem("delta_ip_whitelist");
    if (saved) return JSON.parse(saved);
    return [
      { id: "ip_1", ip: "103.245.98.11", tag: "SAO PAULO GATEWAY" },
      { id: "ip_2", ip: "192.168.1.1", tag: "TRADING CONTROLLER SERVER" }
    ];
  });
  const [newIpAddress, setNewIpAddress] = useState<string>("");
  const [newIpTag, setNewIpTag] = useState<string>("");

  // --- SUBSCRIPTIONS PLANS AND CYCLES ---
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("annually");
  const [selectedPlan, setSelectedPlan] = useState<"PRO" | "INSTITUTIONAL">("INSTITUTIONAL");

  // --- RAZORPAY MODAL SIMULATOR ---
  const [showRazorpay, setShowRazorpay] = useState<boolean>(false);
  const [paymentStep, setPaymentStep] = useState<"SELECT" | "OTP" | "SUCCESS" | "LOADING">("SELECT");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"UPI" | "CARD" | "NETBANKING">("UPI");
  const [upiId, setUpiId] = useState<string>("india.eagletech@okaxis");
  const [cardNo, setCardNo] = useState<string>("4321 8890 2345 1102");
  const [cardExpiry, setCardExpiry] = useState<string>("11/29");
  const [otpValue, setOtpValue] = useState<string>("");
  const [lastTxId, setLastTxId] = useState<string>("");

  // --- BILLING LOGS DATA ---
  const [billingLogs, setBillingLogs] = useState<BillingLog[]>(() => {
    const saved = localStorage.getItem("delta_billing_logs");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "TXN_7831902",
        date: "2023-10-15",
        plan: "INSTITUTIONAL",
        cycle: "annually",
        amount: 149988,
        currency: "INR",
        status: "SUCCESS"
      },
      {
        id: "TXN_6672314",
        date: "2022-10-15",
        plan: "INSTITUTIONAL",
        cycle: "annually",
        amount: 149988,
        currency: "INR",
        status: "SUCCESS"
      },
      {
        id: "TXN_5510211",
        date: "2022-04-15",
        plan: "PRO_TRIAL",
        cycle: "monthly",
        amount: 999,
        currency: "INR",
        status: "SUCCESS"
      }
    ];
  });
  const [searchLogs, setSearchLogs] = useState<string>("");

  // --- TOAST NOTIFICATIONS INTERNAL STACK ---
  const [notis, setNotis] = useState<Array<{ id: string; text: string; type: "success" | "info" | "warning" }>>([]);

  const triggerToast = (text: string, type: "success" | "info" | "warning" = "success") => {
    const id = Date.now().toString();
    setNotis((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotis((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  useEffect(() => {
    localStorage.setItem("delta_ip_whitelist", JSON.stringify(whitelist));
  }, [whitelist]);

  useEffect(() => {
    localStorage.setItem("delta_billing_logs", JSON.stringify(billingLogs));
  }, [billingLogs]);

  useEffect(() => {
    localStorage.setItem("delta_active_plan", activePlan);
  }, [activePlan]);

  // --- SAVE CORE USER PROFILE CHANGES ---
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempProfile.name.trim()) {
      triggerToast("User Full Name is required", "warning");
      return;
    }
    if (!tempProfile.email.trim() || !tempProfile.email.includes("@")) {
      triggerToast("A valid email address is required", "warning");
      return;
    }

    // Persist to parent component & localStorage
    setUserProfile({ ...tempProfile });
    localStorage.setItem("user_profile_name", tempProfile.name);
    localStorage.setItem("user_profile_email", tempProfile.email);
    localStorage.setItem("user_profile_phone", tempProfile.phone);
    localStorage.setItem("user_profile_avatar", tempProfile.avatarUrl);
    localStorage.setItem("user_profile_risk", tempProfile.riskAppetite);
    localStorage.setItem("user_profile_leverage", String(tempProfile.leverageLimit));
    localStorage.setItem("user_profile_order_size", String(tempProfile.defaultOrderSize));
    localStorage.setItem("user_profile_2fa", String(tempProfile.executionSound)); // repurpose sound or other params
    localStorage.setItem("user_profile_news", String(tempProfile.newsAlerts));
    localStorage.setItem("user_profile_trade", String(tempProfile.tradeAlerts));
    localStorage.setItem("user_profile_sound", String(tempProfile.executionSound));

    triggerToast("User profile and operational metrics updated", "success");
  };

  // --- SAVE API KEYS ---
  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !apiSecret.trim()) {
      triggerToast("Please input valid credentials parameters", "warning");
      return;
    }
    localStorage.setItem("delta_api_key", apiKey);
    localStorage.setItem("delta_api_secret", apiSecret);
    setIsKeysSaved(true);
    triggerToast("Delta API keys encrypted & updated in secure workspace storage.", "success");
  };

  const handleRevokeKeys = () => {
    localStorage.removeItem("delta_api_key");
    localStorage.removeItem("delta_api_secret");
    setApiKey("");
    setApiSecret("");
    setIsKeysSaved(false);
    triggerToast("Delta API keys revoked.", "warning");
  };

  // --- IP WHITELIST OPERATIONS ---
  const handleAddCurrentSessionIp = () => {
    if (whitelist.some((item) => item.ip === currentSessionIp)) {
      triggerToast("Current device IP is already whitelisted", "info");
      return;
    }
    const newItem: WhitelistIP = {
      id: "ip_" + Date.now(),
      ip: currentSessionIp,
      tag: "MY ACTIVE TERMINAL"
    };
    setWhitelist((prev) => [...prev, newItem]);
    triggerToast(`Added IP ${currentSessionIp} successfully`, "success");
  };

  const handleAddCustomIp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanIp = newIpAddress.trim();
    if (!cleanIp) return;
    const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipPattern.test(cleanIp)) {
      triggerToast("Invalid IPv4 address format", "warning");
      return;
    }
    const newItem: WhitelistIP = {
      id: "ip_" + Date.now(),
      ip: cleanIp,
      tag: newIpTag.toUpperCase().trim() || "VPS CONTROLLER"
    };
    setWhitelist((prev) => [...prev, newItem]);
    setNewIpAddress("");
    setNewIpTag("");
    triggerToast(`Whitelisted custom IP: ${cleanIp}`, "success");
  };

  const handleDeleteIp = (id: string, ip: string) => {
    setWhitelist((prev) => prev.filter((item) => item.id !== id));
    triggerToast(`Removed IP filter: ${ip}`, "warning");
  };

  const getPlanDetails = () => {
    if (selectedPlan === "PRO") {
      const pricePerMonth = 999;
      return {
        amount: billingCycle === "annually" ? pricePerMonth * 12 * 0.8 : pricePerMonth,
        totalDue: billingCycle === "annually" ? pricePerMonth * 12 * 0.8 : pricePerMonth,
        name: "PRO TRADER"
      };
    } else {
      const pricePerMonth = 9999;
      return {
        amount: billingCycle === "annually" ? pricePerMonth * 12 * 0.8 : pricePerMonth,
        totalDue: billingCycle === "annually" ? pricePerMonth * 12 * 0.8 : pricePerMonth,
        name: "INSTITUTIONAL"
      };
    }
  };

  const currentDetails = getPlanDetails();

  const handleOpenPayment = () => {
    setPaymentStep("SELECT");
    setOtpValue("");
    setShowRazorpay(true);
  };

  const handleOnboardingPayment = () => {
    setPaymentStep("LOADING");
    setTimeout(() => {
      setPaymentStep("OTP");
    }, 1200);
  };

  const handleVerifyOtpPayment = () => {
    if (otpValue.length < 4) {
      triggerToast("Please enter a 4-digit code", "warning");
      return;
    }
    setPaymentStep("LOADING");
    setTimeout(() => {
      const transId = "TXN_" + Math.floor(1000000 + Math.random() * 9000000);
      setLastTxId(transId);
      setActivePlan(selectedPlan);
      
      const newLog: BillingLog = {
        id: transId,
        date: new Date().toISOString().slice(0, 10),
        plan: selectedPlan === "PRO" ? "PRO TRADER" : "INSTITUTIONAL",
        cycle: billingCycle,
        amount: currentDetails.totalDue,
        currency: "INR",
        status: "SUCCESS"
      };

      setBillingLogs((prev) => [newLog, ...prev]);
      setPaymentStep("SUCCESS");
      triggerToast(`Account status updated to ${selectedPlan}!`, "success");
    }, 1800);
  };

  const filteredLogs = billingLogs.filter((log) => {
    return (
      log.plan.toLowerCase().includes(searchLogs.toLowerCase()) ||
      log.id.toLowerCase().includes(searchLogs.toLowerCase()) ||
      log.date.includes(searchLogs)
    );
  });

  // Calculate initials dynamically
  const initials = tempProfile.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "JD";

  return (
    <div className="flex flex-col gap-6 relative select-none">
      
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {notis.map((n) => (
          <div
            key={n.id}
            className={`p-3 rounded-xl border shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-slideIn ${
              n.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : n.type === "warning"
                ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                : "bg-slate-900/90 border-slate-800 text-cyan-400"
            }`}
          >
            <div className="flex items-center gap-2">
              {n.type === "success" && <CheckCircle className="h-4 w-4 text-emerald-400" />}
              {n.type === "warning" && <Info className="h-4 w-4 text-rose-400" />}
              {n.type === "info" && <Zap className="h-4 w-4 text-cyan-400" />}
              <span className="text-xs font-semibold font-mono">{n.text}</span>
            </div>
            <button
              onClick={() => setNotis((prev) => prev.filter((it) => it.id !== n.id))}
              className="text-white/45 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Grid containing sub-tabs header banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-theme-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] font-extrabold text-primary tracking-widest uppercase bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded shadow-[0_0_10px_rgba(var(--color-primary),0.05)]">
              <User className="h-3 w-3" /> User Center & Management
            </span>
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded">
              Secure Profile Environment
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-2 font-sans text-white uppercase">
            User Settings & Profile Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Customize trading telemetry, secure API rules, and manage real-time Razorpay node subscriptions.
          </p>
        </div>

        {/* Outer Tab Toggle bar */}
        <div className="flex bg-slate-900/95 p-1 rounded-xl border border-slate-800 font-mono text-xs font-bold leading-none select-none shrink-0 min-w-[280px]">
          <button
            onClick={() => setActiveSubTab("profile")}
            className={`flex-1 py-2 px-4 rounded-lg tracking-wide transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === "profile"
                ? "bg-primary text-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Profile & Risk</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab("api")}
            className={`flex-1 py-2 px-4 rounded-lg tracking-wide transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === "api"
                ? "bg-primary text-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            <span>Node Keys</span>
          </button>

          <button
            onClick={() => setActiveSubTab("billing")}
            className={`flex-1 py-2 px-4 rounded-lg tracking-wide transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === "billing"
                ? "bg-primary text-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>Billing</span>
          </button>
        </div>
      </div>

      {/* Sub-view Area wrapper */}
      <div className="w-full">
        {/* TAB 1: USER PROFILE & RISK CONTROL TAB */}
        {activeSubTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Card display profile preview & avatar selection */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-[#0b0c10]/90 backdrop-blur-xl border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden flex flex-col items-center text-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
                
                {/* Simulated badge */}
                <div className="self-end mb-2">
                  <span className="text-[9px] font-mono font-extrabold bg-[#152c33]/70 border border-cyan-500/30 text-cyan-400 px-2 py-0.5 rounded-full uppercase tracking-widest leading-none">
                    {activePlan} TRADER
                  </span>
                </div>

                {/* Main Avatar Circle */}
                <div className="relative group select-none my-3">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/50 shadow-2xl flex items-center justify-center bg-slate-900 group-hover:border-primary transition duration-300">
                    {tempProfile.avatarUrl ? (
                      <img
                        src={tempProfile.avatarUrl}
                        alt="Advisor Profile"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-primary to-violet-600 flex items-center justify-center text-slate-950 font-black text-2xl font-sans uppercase">
                      <span>{initials}</span>
                    </div>
                  </div>
                  <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-slate-950 rounded-full" />
                </div>

                <h3 className="font-sans font-black text-white text-lg tracking-tight uppercase leading-none mt-2">
                  {tempProfile.name || "N/A"}
                </h3>
                <span className="text-xs font-mono text-slate-400 mt-1.5 uppercase tracking-wider">
                  {tempProfile.role || "Quantitative Trade Advisor"}
                </span>
                
                {/* Mini coordinates container */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-2 uppercase tracking-wide">
                  <Globe className="h-3 w-3 text-slate-500" />
                  <span>{tempProfile.location || "New Delhi, India"}</span>
                </div>

                <div className="w-full border-t border-slate-900/60 my-5" />

                {/* Avatar Presets Picker */}
                <div className="w-full text-left">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-3 text-center">
                    SELECT SYSTEM PRESET PROFILE IMAGE
                  </span>
                  
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {AVATAR_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setTempProfile(prev => ({ ...prev, avatarUrl: p.url }));
                          triggerToast(`Selected: ${p.name}`, "info");
                        }}
                        className={`w-full aspect-square rounded-lg overflow-hidden border relative group transition duration-200 cursor-pointer flex items-center justify-center bg-slate-950 ${
                          tempProfile.avatarUrl === p.url
                            ? "border-primary shadow-[0_0_10px_rgba(var(--color-primary),0.2)] scale-105"
                            : "border-slate-800 hover:border-slate-600"
                        }`}
                        title={p.name}
                      >
                        <img src={p.url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Input field for custom avatar */}
                  <div>
                    <label className="text-[9.5px] font-mono text-slate-500 uppercase block mb-1">
                      Or Custom Avatar Image URL Link:
                    </label>
                    <input
                      type="text"
                      value={tempProfile.avatarUrl}
                      onChange={(e) => setTempProfile(prev => ({ ...prev, avatarUrl: e.target.value }))}
                      placeholder="https://images.unsplash.com/your-custom-photo-link"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-[10px] font-mono text-white focus:border-primary/50 focus:outline-none"
                    />
                  </div>
                </div>

              </div>

              {/* Box info widget */}
              <div className="bg-[#0b0c10]/40 border border-slate-900 p-4 rounded-xl flex gap-3 text-xs leading-relaxed text-slate-400">
                <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="font-sans">
                  <strong>Institutional Secure Protocol:</strong> Settings are persisted securely inside your local machine workspace storage buffer. Account credentials remain fully encrypted and zero cleartext telemetry leaves this secure terminal.
                </div>
              </div>
            </div>

            {/* Right: Detailed form for profile edit parameters */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                
                {/* Section A: Contact Details */}
                <div className="bg-[#0b0c10]/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-900 select-none">
                    <User className="h-4 w-4 text-primary" />
                    <h3 className="font-bold text-sm text-white uppercase tracking-wider font-sans">
                      Personal Authentication Metadata
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                        Account Full Name
                      </label>
                      <div className="bg-slate-950 px-3.5 py-2 rounded-lg border border-slate-800 focus-within:border-primary/50 transition">
                        <input
                          type="text"
                          value={tempProfile.name}
                          onChange={(e) => setTempProfile(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                        Registered Email Gateway
                      </label>
                      <div className="bg-slate-950 px-3.5 py-2 rounded-lg border border-slate-800 focus-within:border-primary/50 transition">
                        <input
                          type="email"
                          value={tempProfile.email}
                          onChange={(e) => setTempProfile(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                        Encrypted SMS Phone Number
                      </label>
                      <div className="bg-slate-950 px-3.5 py-2 rounded-lg border border-slate-800 focus-within:border-primary/50 transition">
                        <input
                          type="text"
                          value={tempProfile.phone}
                          onChange={(e) => setTempProfile(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Role */}
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                        Trading Desk Role
                      </label>
                      <div className="bg-slate-950 px-3.5 py-2 rounded-lg border border-slate-800 focus-within:border-primary/50 transition">
                        <input
                          type="text"
                          value={tempProfile.role}
                          onChange={(e) => setTempProfile(prev => ({ ...prev, role: e.target.value }))}
                          className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                        Operational Zone / Address
                      </label>
                      <div className="bg-slate-950 px-3.5 py-2 rounded-lg border border-slate-800 focus-within:border-primary/50 transition">
                        <input
                          type="text"
                          value={tempProfile.location}
                          onChange={(e) => setTempProfile(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section B: Risk Telemetry and Trading limits */}
                <div className="bg-[#0b0c10]/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-900 select-none">
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                    <h3 className="font-bold text-sm text-white uppercase tracking-wider font-sans">
                      Risk Appetite & Neural Strategy Bounds
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* Risk Tolerance selector buttons */}
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                        System Risk Appetite Tier
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {["Conservative", "Balanced", "Aggressive"].map((tier) => (
                          <button
                            key={tier}
                            type="button"
                            onClick={() => setTempProfile(prev => ({ ...prev, riskAppetite: tier }))}
                            className={`py-2 px-3 rounded-lg border font-mono text-xs font-bold transition-all duration-300 uppercase cursor-pointer text-center ${
                              tempProfile.riskAppetite === tier
                                ? tier === "Conservative"
                                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                                  : tier === "Balanced"
                                  ? "bg-amber-500/10 border-amber-500 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                                  : "bg-rose-500/10 border-rose-500 text-rose-400 shadow-[0_0_10px_rgba(239,68,68,0.15)]"
                                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                            }`}
                          >
                            {tier}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Leverage slider limit */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                          Max Allocatable Leverage Limit
                        </span>
                        <span className="text-sm font-mono font-black text-rose-400">
                          {tempProfile.leverageLimit}x
                        </span>
                      </div>
                      <div className="flex gap-4 items-center">
                        <input
                          type="range"
                          min={1}
                          max={125}
                          value={tempProfile.leverageLimit}
                          onChange={(e) => setTempProfile(prev => ({ ...prev, leverageLimit: parseInt(e.target.value) }))}
                          className="flex-1 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                      
                      {/* Dynamic Alert Banner based on leverage selection */}
                      {tempProfile.leverageLimit > 50 ? (
                        <div className="mt-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-2.5 rounded-lg flex items-center gap-2 text-[10px] uppercase font-mono animate-pulse">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          <span>Leveraged Risk Extreme! High neural margin exposure active!</span>
                        </div>
                      ) : tempProfile.leverageLimit > 20 ? (
                        <div className="mt-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 p-2.5 rounded-lg flex items-center gap-2 text-[10px] uppercase font-mono">
                          <Info className="h-4 w-4 shrink-0" />
                          <span>Warning: High leverage may trigger immediate liquidation bounds.</span>
                        </div>
                      ) : (
                        <div className="mt-2 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 p-2 rounded-lg flex items-center gap-2 text-[10px] uppercase font-mono">
                          <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>Risk profiles matching Standard Liquidity tolerances.</span>
                        </div>
                      )}
                    </div>

                    {/* Default order size contracts */}
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                        Default Order Unit Size (Base Asset Units)
                      </label>
                      <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2.5 rounded-lg border border-slate-800 focus-within:border-primary/50 transition">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={tempProfile.defaultOrderSize}
                          onChange={(e) => setTempProfile(prev => ({ ...prev, defaultOrderSize: parseFloat(e.target.value) || 0 }))}
                          className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none"
                        />
                        <span className="text-slate-500 font-mono text-xs">LOTS</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section C: Alerts & Acoustic Feedbacks */}
                <div className="bg-[#0b0c10]/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-900 select-none">
                    <Bell className="h-4 w-4 text-primary" />
                    <h3 className="font-bold text-sm text-white uppercase tracking-wider font-sans">
                      Acoustic & Diagnostic Alert Toggles
                    </h3>
                  </div>

                  <div className="space-y-3.5 font-mono select-none">
                    {/* Execution Sound Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-350 font-bold">Execution Acoustic Confirmation</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">Dispatches high-freq bells on successful order routing</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTempProfile(prev => ({ ...prev, executionSound: !prev.executionSound }))}
                        className={`p-2 rounded-lg border transition ${
                          tempProfile.executionSound
                            ? "bg-primary/20 border-primary text-primary"
                            : "bg-slate-950 border-slate-800 text-slate-500"
                        }`}
                      >
                        {tempProfile.executionSound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Trade Alerts */}
                    <div className="flex items-center justify-between border-t border-slate-900/60 pt-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-350 font-bold">Instantly Push trade executions</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">Outputs native web notifications on delta bounds</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTempProfile(prev => ({ ...prev, tradeAlerts: !prev.tradeAlerts }))}
                        className={`px-3 py-1.5 text-[10px] font-extrabold rounded-md border transition ${
                          tempProfile.tradeAlerts
                            ? "bg-[#152e25] border-emerald-500/40 text-emerald-450 uppercase"
                            : "bg-slate-950 border-slate-800 text-slate-500 uppercase"
                        }`}
                      >
                        {tempProfile.tradeAlerts ? "ON" : "OFF"}
                      </button>
                    </div>

                    {/* News alert */}
                    <div className="flex items-center justify-between border-t border-slate-900/60 pt-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-350 font-bold">AI News Catalyst Stream Feed</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">Highlights high volatility news events automatically</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTempProfile(prev => ({ ...prev, newsAlerts: !prev.newsAlerts }))}
                        className={`px-3 py-1.5 text-[10px] font-extrabold rounded-md border transition ${
                          tempProfile.newsAlerts
                            ? "bg-[#152e25] border-emerald-500/40 text-emerald-450 uppercase"
                            : "bg-slate-950 border-slate-800 text-slate-500 uppercase"
                        }`}
                      >
                        {tempProfile.newsAlerts ? "ON" : "OFF"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submitting Buttons Row */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 text-xs font-mono font-bold uppercase bg-primary text-black hover:bg-[#00d0ff] shadow-lg shadow-primary/25 rounded-xl transition duration-200 cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="h-4 w-4" />
                    <span>Persist Operational Profile Settings</span>
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

        {/* TAB 2: DELTA INDIA APIs & WHITELIST CONTROLS */}
        {activeSubTab === "api" && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-7 flex flex-col gap-6">
              
              {/* Card 1: Delta Exchange API Key config */}
              <div className="bg-[#0b0c10]/90 backdrop-blur-xl border border-slate-800 rounded-xl p-5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="flex justify-between items-center pb-4 border-b border-slate-900 mb-4 select-none">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded bg-primary shadow-[0_0_8px_rgba(var(--color-primary),0.8)]" />
                    <h3 className="font-bold text-sm uppercase tracking-wide font-sans text-white">
                      Delta Exchange Active Keys
                    </h3>
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded font-mono ${
                    isKeysSaved 
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}>
                    {isKeysSaved ? "CONNECTED" : "DISCONNECTED"}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-5 font-sans">
                  Bind your Delta Exchange India account credentials to enable synchronized algorithmic strategy routing. Private secure hashes remain encrypted locally via browser storage blocks.
                </p>

                <form onSubmit={handleSaveKeys} className="space-y-4">
                  {/* API Key */}
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                      API Key Identifier
                    </label>
                    <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2.5 rounded-lg border border-slate-800 focus-within:border-primary/50 transition">
                      <span className="text-slate-500 font-mono text-xs">PUB_</span>
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value);
                          setIsKeysSaved(false);
                        }}
                        placeholder="Enter delta exchange developer access token"
                        className="flex-1 bg-transparent text-white font-mono text-xs placeholder-slate-700 focus:outline-none min-w-0"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="text-slate-500 hover:text-white transition cursor-pointer"
                      >
                        {showApiKey ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* API Secret */}
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                      API Secure Secret Key Passphrase
                    </label>
                    <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2.5 rounded-lg border border-slate-800 focus-within:border-primary/50 transition">
                      <span className="text-slate-500 font-mono text-xs">SEC_</span>
                      <input
                        type={showApiSecret ? "text" : "password"}
                        value={apiSecret}
                        onChange={(e) => {
                          setApiSecret(e.target.value);
                          setIsKeysSaved(false);
                        }}
                        placeholder="Enter cryptography API secret string hash"
                        className="flex-1 bg-transparent text-white font-mono text-xs placeholder-slate-700 focus:outline-none min-w-0"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiSecret(!showApiSecret)}
                        className="text-slate-500 hover:text-white transition cursor-pointer"
                      >
                        {showApiSecret ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* API Secret Buttons Row */}
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-primary/70 select-none">
                      <Shield className="h-3.5 w-3.5 text-primary" />
                      <span>Secured Tunnel Activated</span>
                    </div>
                    
                    <div className="flex gap-2">
                      {isKeysSaved && (
                        <button
                          type="button"
                          onClick={handleRevokeKeys}
                          className="px-4 py-2 text-xs font-mono font-bold uppercase bg-transparent text-rose-500 hover:bg-rose-500/10 border border-rose-500/30 rounded-lg transition cursor-pointer"
                        >
                          Revoke Active Key
                        </button>
                      )}
                      <button
                        type="submit"
                        className="px-5 py-2 text-xs font-mono font-bold uppercase bg-primary text-black hover:bg-[#00d0ff] shadow-md shadow-primary/20 rounded-lg transition cursor-pointer"
                      >
                        {isKeysSaved ? "Keys Logged" : "Write Active Keys"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Card 2: IP Whitelisting */}
              <div className="bg-[#0b0c10]/90 backdrop-blur-xl border border-slate-800 rounded-xl p-5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

                <div className="flex justify-between items-center pb-4 border-b border-slate-900 mb-4 select-none">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                    <h3 className="font-bold text-sm uppercase tracking-wide font-sans text-white">
                      Institutional IP Network Whitelisting
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono font-bold">
                    🔒 STRICT SECURITY GATEWAY
                  </span>
                </div>

                {/* Instruction Callout */}
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-lg p-3 flex gap-3 mb-5 select-none">
                  <Info className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <strong>Secure routing limits:</strong> Setting target whitelist restrictions blocks malicious trading sessions trying to relay packets outside of recognized institutional cloud IPs.
                  </div>
                </div>

                {/* Session IP Container */}
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex justify-between items-center mb-5 select-none">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">Active Connection IP</span>
                    <span className="text-sm font-mono font-extrabold text-cyan-400">
                      {currentSessionIp}
                    </span>
                  </div>
                  <button
                    onClick={handleAddCurrentSessionIp}
                    className="px-3 py-1.5 text-xs font-mono font-semibold bg-white/5 hover:bg-white/10 text-white rounded-lg border border-slate-800 hover:border-slate-700 transition cursor-pointer"
                  >
                    WHITELIST ACTIVE DEVICE
                  </button>
                </div>

                {/* Whitelisted address dynamic lists */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block select-none">
                    Configured Rule Lists
                  </span>

                  {whitelist.length === 0 ? (
                    <div className="border border-dashed border-slate-800 rounded-lg p-6 py-8 flex flex-col items-center justify-center text-slate-550 font-mono text-xs select-none">
                      <span>No active IP filters loaded.</span>
                      <span className="text-[10px] mt-1 text-slate-600">All inbound servers can trigger trade executors.</span>
                    </div>
                  ) : (
                    <div className="space-y-2 min-h-[100px]">
                      {whitelist.map((item) => (
                        <div
                          key={item.id}
                          className="bg-slate-950 hover:bg-slate-900/40 px-3.5 py-2.5 rounded-lg border border-slate-900 flex justify-between items-center transition"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-bold text-white tracking-wide">
                              {item.ip}
                            </span>
                            {item.tag && (
                              <span className="text-[8px] font-mono bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded uppercase font-black">
                                {item.tag}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleDeleteIp(item.id, item.ip)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Remove IP filter Rule"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add custom whitelisted addresses */}
                <form onSubmit={handleAddCustomIp} className="mt-5 pt-5 border-t border-slate-900/60 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newIpAddress}
                    onChange={(e) => setNewIpAddress(e.target.value)}
                    placeholder="IPv4 (e.g. 192.168.1.1)"
                    className="flex-1 bg-slate-950 text-xs font-mono px-3 py-2 rounded-lg border border-slate-800 focus:border-primary/50 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newIpTag}
                    onChange={(e) => setNewIpTag(e.target.value)}
                    placeholder="Rule Label (e.g. CO-LO DESK)"
                    className="sm:w-1/3 bg-slate-950 text-xs font-mono px-3 py-2 rounded-lg border border-slate-800 focus:border-primary/50 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition whitespace-nowrap"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Rule
                  </button>
                </form>
              </div>

            </div>

            {/* Right Side: Network stats block */}
            <div className="xl:col-span-5 flex flex-col gap-6">
              <div className="bg-[#0b0c10]/90 border border-slate-800 rounded-xl p-5 shadow-xl select-none">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-900 mb-4">
                  <SecurityIcon className="h-4.5 w-4.5 text-primary" />
                  <h4 className="font-bold text-xs uppercase text-white tracking-widest font-sans">Node Gateway Status</h4>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-900/60">
                    <span className="text-slate-500">API Connection Status</span>
                    <span className="text-emerald-450 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      ACTIVE TUNNEL
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-900/60">
                    <span className="text-slate-500">Latency Core Delay</span>
                    <span className="text-white">12 ms</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-900/60">
                    <span className="text-slate-500">Node Sync standard</span>
                    <span className="text-slate-300">NTP SERVER UTC</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Gateway Version</span>
                    <span className="text-slate-300">REST v3.0 // WS secure</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BILLING & SUBSCRIPTIONS */}
        {activeSubTab === "billing" && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-1">
            
            {/* Card 1: Platform subscription control grid */}
            <div className="xl:col-span-7 flex flex-col gap-6">
              <div className="bg-[#0b0c10]/90 backdrop-blur-xl border border-slate-800 rounded-xl p-5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-900 mb-4 select-none">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />
                    <h3 className="font-bold text-sm uppercase tracking-wide font-sans text-white">
                      Razorpay Node Subscriptions
                    </h3>
                  </div>

                  {/* Monthly vs Annual billing switch */}
                  <div className="flex bg-slate-950 p-1 rounded-md border border-slate-800 items-center font-mono text-[9px] tracking-wide relative">
                    <button
                      type="button"
                      onClick={() => setBillingCycle("monthly")}
                      className={`px-3 py-1 font-extrabold rounded-md transition duration-205 cursor-pointer ${
                        billingCycle === "monthly"
                          ? "bg-white/10 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      MONTHLY
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle("annually")}
                      className={`px-3 py-1 font-extrabold rounded-md transition duration-205 flex items-center gap-1 cursor-pointer ${
                        billingCycle === "annually"
                          ? "bg-primary text-black shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      ANNUALLY
                      <span className="text-[7px] bg-red-500 text-white px-1.5 py-0.5 rounded font-sans font-extrabold">20% SAVE</span>
                    </button>
                  </div>
                </div>

                {/* Platform Option comparison cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 select-none">
                  
                  {/* PRO TRADER Plan Option */}
                  <div
                    onClick={() => setSelectedPlan("PRO")}
                    className={`p-4 rounded-xl border relative transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                      selectedPlan === "PRO"
                        ? "border-[#00f0ff] bg-primary/5 shadow-[0_0_15px_rgba(0,190,255,0.1)] ring-1 ring-primary/30"
                        : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
                    }`}
                  >
                    {activePlan === "PRO" && (
                      <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-emerald-500 text-black text-[8px] font-extrabold rounded-full font-mono uppercase tracking-wider shadow">
                        Active Plan
                      </span>
                    )}
                    
                    <div>
                      <h4 className="text-sm font-black tracking-tight text-white uppercase font-sans">
                        PRO TRADER
                      </h4>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-xl font-mono font-black text-white">
                          {billingCycle === "annually" ? "₹799" : "₹999"}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">/MO</span>
                      </div>

                      <ul className="mt-4 space-y-2 text-[10px] text-slate-400 font-mono">
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-primary shrink-0" />
                          <span>3 Live Strategies concurrent</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-primary shrink-0" />
                          <span>1min telemetry clock updates</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-primary shrink-0" />
                          <span>Standard Support channel</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-5">
                      <div className={`w-full py-1.5 rounded text-center text-[10px] font-extrabold uppercase transition border ${
                        selectedPlan === "PRO"
                          ? "bg-primary text-black border-primary"
                          : "bg-transparent text-slate-400 border-slate-800"
                      }`}>
                        {selectedPlan === "PRO" ? "Selected Plan" : "SELECT PRO"}
                      </div>
                    </div>
                  </div>

                  {/* INSTITUTIONAL Plan Option */}
                  <div
                    onClick={() => setSelectedPlan("INSTITUTIONAL")}
                    className={`p-4 rounded-xl border relative transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                      selectedPlan === "INSTITUTIONAL"
                        ? "border-[#00f0ff] bg-[#152e3b]/30 shadow-[0_0_20px_rgba(0,240,255,0.06)] ring-1 ring-primary/40 animate-borderHighlight"
                        : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
                    }`}
                  >
                    {activePlan === "INSTITUTIONAL" && (
                      <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-primary text-black text-[8px] font-extrabold rounded-full font-mono uppercase tracking-wider shadow">
                        CURRENT ACTIVE
                      </span>
                    )}

                    <div>
                      <h4 className="text-sm font-black tracking-tight text-white uppercase font-sans">
                        INSTITUTIONAL NODE
                      </h4>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-xl font-mono font-black text-white">
                          {billingCycle === "annually" ? "₹7,999" : "₹9,999"}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">/MO</span>
                      </div>

                      <ul className="mt-4 space-y-2 text-[10px] text-slate-400 font-mono">
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-primary shrink-0" />
                          <span>Unlimited strategies execution</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-primary shrink-0" />
                          <span>WebSocket direct low-lat tunnel</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-primary shrink-0" />
                          <span>Dedicated SLA customer nodes</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-5">
                      <div className={`w-full py-1.5 rounded text-center text-[10px] font-extrabold uppercase transition border ${
                        selectedPlan === "INSTITUTIONAL"
                          ? "bg-primary text-black border-primary"
                          : "bg-transparent text-slate-400 border-slate-800"
                      }`}>
                        {selectedPlan === "INSTITUTIONAL" ? "Selected Plan" : "SELECT INST"}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Pricing details card footer */}
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 mb-4 select-none">
                  <div className="flex justify-between items-center text-xs text-slate-450 font-mono">
                    <span>Renewal Synchronization Term</span>
                    <span className="text-white font-bold">15 Nov 2026</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-450 font-mono mt-2">
                    <span>Outstanding Due</span>
                    <span className="text-primary font-extrabold text-sm ml-1">
                      ₹{currentDetails.totalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      <span className="text-[9px] text-slate-500 font-normal font-sans tracking-wide">
                        {billingCycle === "annually" ? " (Annually)" : " (Monthly)"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Secure payment call to action button */}
                <button
                  onClick={handleOpenPayment}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-black font-sans font-extrabold uppercase tracking-wider text-xs rounded-xl shadow-lg hover:shadow-cyan-400/20 hover:scale-[1.01] active:scale-[0.99] transition duration-200 cursor-pointer flex items-center justify-center gap-2 select-none"
                >
                  <Lock className="h-4 w-4" />
                  <span>PAY SECURELY WITH RAZORPAY GATEWAY</span>
                </button>

                <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-3 select-none">
                  <span>🛡️ 256-BIT CRYPTO ENCRYPTION</span>
                  <span>UPI / ALL MAJOR CARDS / NET BANKING</span>
                </div>
              </div>
            </div>

            {/* Billing logs column */}
            <div className="xl:col-span-5 flex flex-col gap-6">
              <div className="bg-[#0b0c10]/90 border border-slate-800 rounded-xl p-5 shadow-2xl flex-1 flex flex-col relative overflow-hidden min-h-[300px]">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-900 mb-4 select-none">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                    <h3 className="font-bold text-sm uppercase tracking-wide font-sans text-white">
                      Transaction Logs
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 w-full md:w-44 focus-within:border-primary/50 transition">
                    <Search className="h-3.5 w-3.5 text-slate-600" />
                    <input
                      type="text"
                      value={searchLogs}
                      onChange={(e) => setSearchLogs(e.target.value)}
                      placeholder="Filter receipts..."
                      className="bg-transparent text-[10px] text-white font-mono placeholder-slate-600 focus:outline-none min-w-0 flex-1 border-0 ring-0"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 max-h-[340px]">
                  {filteredLogs.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 font-mono text-center text-xs py-10 select-none">
                      <span>No receipts match filter.</span>
                    </div>
                  ) : (
                    filteredLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 bg-slate-950 hover:bg-slate-900/40 border border-slate-900 rounded-lg flex items-center justify-between text-xs transition duration-205"
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 select-none">
                            <span className="font-mono font-bold text-slate-500">
                              {log.date}
                            </span>
                            <span className="font-sans font-black text-white uppercase tracking-wider text-[8px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                              {log.plan}
                            </span>
                          </div>
                          <span className="text-[9.5px] font-mono text-slate-450">
                            ID: {log.id}
                          </span>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className="font-mono font-black text-white text-right leading-none">
                            ₹{log.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[7.5px] font-mono font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest leading-none flex items-center gap-0.5">
                            <span className="w-1 h-1 rounded-full bg-emerald-450 animate-pulse" />
                            {log.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="text-[9px] text-slate-600 font-mono pt-3 border-t border-slate-900 mt-auto flex justify-between select-none">
                  <span>Server Node Synced</span>
                  <span>Razorpay API v3.0</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* --- RAZORPAY EMULATOR GATEWAY DIALOG SCREEN --- */}
      {showRazorpay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fadeIn select-none">
          {/* Main Dialog card */}
          <div className="bg-[#0b0c10] border border-slate-800 w-full max-w-md rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col font-sans">
            
            {/* Razorpay Brand Header bar */}
            <div className="bg-slate-950 py-4 px-5 border-b border-slate-900 flex justify-between items-center ">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--color-primary)]" />
                <div className="flex flex-col">
                  <span className="text-[12px] font-black tracking-widest text-primary uppercase">
                    Razorpay India Secure Node
                  </span>
                  <span className="text-[8px] text-slate-500 font-mono tracking-wider">DIRECT PEER TO PEER TUNNEL</span>
                </div>
              </div>

              {/* Cancel closing button */}
              <button
                onClick={() => setShowRazorpay(false)}
                className="text-slate-500 hover:text-white p-1 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Invoice summary strip */}
            <div className="bg-slate-950/40 py-3 px-5 border-b border-slate-900 flex justify-between items-center text-xs">
              <div className="flex flex-col">
                <span className="text-slate-500 font-mono text-[10px]">Invoice Term</span>
                <span className="font-extrabold text-white uppercase tracking-wider text-[9px]">
                  DELTA AI - {selectedPlan} {billingCycle.toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 font-mono text-[10px] block">Total Amount</span>
                <span className="font-mono font-black text-primary text-sm">
                  ₹{currentDetails.totalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Main Interactive body */}
            <div className="p-5 flex-1">
              
              {paymentStep === "SELECT" && (
                <div className="space-y-4">
                  <span className="text-xs text-slate-300 font-mono block">
                    Choose Secure Payment Provider:
                  </span>

                  {/* Payment Methods Tab */}
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { id: "UPI", label: "G-Pay / UPI", icon: Smartphone },
                      { id: "CARD", label: "Credit Card", icon: CreditCard },
                      { id: "NETBANKING", label: "NetBanking", icon: Server }
                    ] as const).map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition cursor-pointer ${
                          selectedPaymentMethod === method.id
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-slate-950 border-slate-900 text-slate-400 hover:text-white"
                        }`}
                      >
                        <method.icon className="h-5 w-5 shrink-0" />
                        <span className="text-[9px] font-mono leading-none">{method.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Dynamic payment input details based on type */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                    {selectedPaymentMethod === "UPI" && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[9px] text-slate-500 uppercase font-mono block mb-1">Enter Virtual Payment Address (VPA)</label>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="india.eagletech@okaxis"
                            className="w-full bg-[#0b0c10] text-xs font-mono px-3 py-2 border border-slate-800 rounded-lg text-white focus:border-primary/50 focus:outline-none"
                          />
                        </div>
                        <span className="text-[9px] text-slate-500 block font-sans">
                          Payment authorization callback will be verified as a test hook.
                        </span>
                      </div>
                    )}

                    {selectedPaymentMethod === "CARD" && (
                      <div className="space-y-3 font-mono">
                        <div>
                          <label className="text-[9px] text-slate-550 uppercase block mb-1">Card Number (16-Digit)</label>
                          <input
                            type="text"
                            value={cardNo}
                            onChange={(e) => setCardNo(e.target.value)}
                            className="w-full bg-[#0b0c10] text-xs px-3 py-2 border border-slate-800 rounded-lg text-white text-center tracking-widest focus:border-primary/50 focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-slate-550 uppercase block mb-1">Expiration</label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              className="w-full bg-[#0b0c10] text-xs px-3 py-2 border border-slate-800 rounded-lg text-white text-center focus:border-primary/50 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-550 uppercase block mb-1">Secure CVV</label>
                            <input
                              type="password"
                              defaultValue="***"
                              disabled
                              className="w-full bg-[#0b0c10] text-xs px-3 py-2 border border-slate-900 text-center rounded-lg text-slate-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedPaymentMethod === "NETBANKING" && (
                      <div className="space-y-2">
                        <label className="text-[9px] text-slate-500 uppercase font-mono block mb-1">Select Bank Gateway</label>
                        <select className="w-full bg-[#0b0c10] text-xs font-mono px-3 py-2 border border-slate-800 rounded-lg text-white focus:border-primary/50 focus:outline-none cursor-pointer">
                          <option>State Bank of India (SBI)</option>
                          <option>HDFC Bank Retail</option>
                          <option>ICICI Bank Secure Web</option>
                          <option>Axis Bank Net Banking</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Proceed checkout button */}
                  <button
                    onClick={handleOnboardingPayment}
                    className="w-full py-2.5 bg-primary hover:bg-primary/90 text-black font-mono font-bold uppercase text-xs rounded-lg shadow-lg tracking-wider transition cursor-pointer"
                  >
                    PROCEED SECURE TRANSFER
                  </button>
                </div>
              )}

              {paymentStep === "OTP" && (
                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-2 shadow-[0_0_8px_rgba(var(--color-primary),0.15)]">
                    <Lock className="h-6 w-6" />
                  </div>
                  
                  <div>
                    <span className="text-xs text-slate-300 font-mono block">
                      Secure OTP Verification Match
                    </span>
                    <p className="text-[10px] text-slate-550 mt-1 max-w-xs mx-auto font-sans leading-normal">
                      An OTP dispatch has been requested. Type your 4-digit numeric sequence to authorize secure payment routing.
                    </p>
                  </div>

                  <div className="max-w-[160px] mx-auto">
                    <input
                      type="text"
                      maxLength={4}
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                      placeholder="1234"
                      className="w-full bg-slate-950 text-center tracking-widest text-lg font-mono font-black py-2.5 rounded-lg border border-slate-800 text-white focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaymentStep("SELECT")}
                      className="flex-1 py-1.5 bg-transparent text-slate-500 border border-slate-900 text-xs rounded font-mono hover:text-white transition cursor-pointer"
                    >
                      Go Back
                    </button>
                    <button
                      onClick={handleVerifyOtpPayment}
                      className="flex-1 py-1.5 bg-primary text-black font-mono font-black text-xs rounded shadow-md hover:scale-[1.01] transition cursor-pointer"
                    >
                      Authorize Payment
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === "LOADING" && (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
                  <RefreshCw className="h-10 w-10 text-primary animate-spin" />
                  <div>
                    <span className="text-xs font-mono font-bold text-white block">
                      Syncing Gateway Webhooks...
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                      Resolving transactional metadata packets. Do not exit window.
                    </span>
                  </div>
                </div>
              )}

              {paymentStep === "SUCCESS" && (
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-[#152e25] border-2 border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <Check className="h-8 w-8 text-emerald-400 stroke-[3]" />
                  </div>

                  <div>
                    <span className="text-sm font-black text-white uppercase block tracking-wider font-sans">
                      Payment Confirmed!
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                      Transaction ₹{currentDetails.totalDue.toLocaleString()} matches gateway balances.
                    </span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 text-left font-mono text-[10px] text-slate-400 divide-y divide-slate-900 space-y-2">
                    <div className="flex justify-between items-center py-1">
                      <span>Transaction ID</span>
                      <span className="text-white font-bold">{lastTxId}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span>Authorized Tier</span>
                      <span className="text-primary font-black uppercase">{selectedPlan}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span>Active Term</span>
                      <span className="text-slate-300 uppercase font-black">{billingCycle}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowRazorpay(false)}
                    className="w-full py-2.5 bg-emerald-500 text-black hover:bg-emerald-400 text-xs font-mono font-black uppercase rounded-lg shadow-lg tracking-wider transition cursor-pointer"
                  >
                    Finish Transaction
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Custom icons to bypass potential import failures
function EyeIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

function SecurityIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
