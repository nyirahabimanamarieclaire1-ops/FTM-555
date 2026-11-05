import React, { useState, useEffect } from 'react';
import { Product } from '../types.ts';
import { Language, translations } from '../i18n/translations.ts';
import { ReadmeTableModal } from './ReadmeTableModal.tsx';
import { 
  Sparkles, 
  ShieldCheck, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  X, 
  Plus, 
  Minus, 
  Smartphone, 
  Clock, 
  Box, 
  Zap, 
  Lock,
  ChevronRight,
  Wine,
  GlassWater,
  Globe,
  BookOpen
} from 'lucide-react';

interface Props {
  onOrderCompleted?: () => void;
  onOpenAdmin?: () => void;
  onOpenTech?: () => void;
}

type Step = 
  | 'WELCOME' 
  | 'AGE_VERIFY' 
  | 'CATALOG' 
  | 'PRODUCT_MODAL' 
  | 'PHONE_PROVIDER' 
  | 'PAYMENT_WAITING' 
  | 'DISPENSING' 
  | 'COMPLETED';

export const CustomerTouchscreen: React.FC<Props> = ({ onOrderCompleted, onOpenAdmin, onOpenTech }) => {
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const t = translations[currentLang];

  const [step, setStep] = useState<Step>('WELCOME');
  const [isAgeVerified18, setIsAgeVerified18] = useState<boolean | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Readme Table Modal state
  const [readmeModalOpen, setReadmeModalOpen] = useState(false);

  // Selection
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // Phone & Provider
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [paymentProvider, setPaymentProvider] = useState<'MTN' | 'AIRTEL'>('MTN');
  const [phoneError, setPhoneError] = useState<string>('');

  // Active Order & Payment
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [activePayment, setActivePayment] = useState<any>(null);
  const [paymentTimeRemaining, setPaymentTimeRemaining] = useState<number>(60);
  const [paymentState, setPaymentState] = useState<'WAITING' | 'SUCCESS' | 'FAILED' | 'EXPIRED'>('WAITING');
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string>('');

  // Simulated Handset USSD prompt modal
  const [enteredPin, setEnteredPin] = useState<string>('');

  // Dispensing state
  const [dispenseProgress, setDispenseProgress] = useState<number>(0);
  const [dispenseStageText, setDispenseStageText] = useState<string>('');
  const [dispenseError, setDispenseError] = useState<string>('');

  // Auto return countdown
  const [completionCountdown, setCompletionCountdown] = useState<number>(10);

  // Fetch product catalog
  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (e) {
      console.error('Failed to load products:', e);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filter products based on age verification and category
  const filteredProducts = products.filter(p => {
    if (!p.is_active) return false;
    // Age check: If customer selected Under 18, strictly block alcoholic beverages
    if (isAgeVerified18 === false && (p.is_alcoholic === 1 || p.age_restricted === 1)) {
      return false;
    }
    if (selectedCategory !== 'ALL' && p.category_id !== selectedCategory) {
      return false;
    }
    return true;
  });

  // Countdown timer for payment waiting
  useEffect(() => {
    let timer: any;
    if (step === 'PAYMENT_WAITING' && paymentState === 'WAITING' && paymentTimeRemaining > 0) {
      timer = setInterval(() => {
        setPaymentTimeRemaining(prev => {
          if (prev <= 1) {
            handlePaymentTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, paymentState, paymentTimeRemaining]);

  // Completion auto-reset countdown
  useEffect(() => {
    let timer: any;
    if (step === 'COMPLETED') {
      timer = setInterval(() => {
        setCompletionCountdown(prev => {
          if (prev <= 1) {
            resetKiosk();
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step]);

  const resetKiosk = () => {
    setStep('WELCOME');
    setIsAgeVerified18(null);
    setSelectedProduct(null);
    setQuantity(1);
    setPhoneNumber('');
    setPaymentProvider('MTN');
    setPhoneError('');
    setActiveOrder(null);
    setActivePayment(null);
    setPaymentState('WAITING');
    setPaymentTimeRemaining(60);
    setPaymentErrorMessage('');
    setDispenseProgress(0);
    setDispenseError('');
    setEnteredPin('');
    loadProducts();
  };

  // Step 2 Age handler
  const handleAgeChoice = (is18Plus: boolean) => {
    setIsAgeVerified18(is18Plus);
    setStep('CATALOG');
  };

  // Step 4 Product selection modal trigger
  const handleSelectProduct = (product: Product) => {
    if ((product.available_quantity || 0) <= 0) return;
    setSelectedProduct(product);
    setQuantity(1);
    setStep('PRODUCT_MODAL');
  };

  // Step 5 Proceed to checkout
  const handleProceedToPhone = () => {
    setStep('PHONE_PROVIDER');
  };

  // Phone number keypad helper
  const handleKeypadPress = (val: string) => {
    if (val === 'CLEAR') {
      setPhoneNumber('');
    } else if (val === 'BACK') {
      setPhoneNumber(prev => prev.slice(0, -1));
    } else {
      if (phoneNumber.length < 13) {
        setPhoneNumber(prev => prev + val);
      }
    }
    setPhoneError('');
  };

  // Quick prefix presets
  const handleSetPrefix = (prefix: string) => {
    setPhoneNumber(prefix);
    if (prefix === '078' || prefix === '079') {
      setPaymentProvider('MTN');
    } else if (prefix === '072' || prefix === '073') {
      setPaymentProvider('AIRTEL');
    }
    setPhoneError('');
  };

  // Step 7: Send Payment Request
  const handleInitiatePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      setPhoneError(t.phoneFormatHelp);
      return;
    }

    try {
      // 1. Create order in database
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct?.id,
          quantity,
          customerPhone: phoneNumber,
          paymentProvider,
          ageVerified: isAgeVerified18
        })
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        setPhoneError(orderData.error || 'Failed to initialize order');
        return;
      }

      setActiveOrder(orderData.order);

      // 2. Request Mobile Money USSD prompt via backend provider API
      const payRes = await fetch('/api/payments/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderData.order.id,
          phone: phoneNumber,
          provider: paymentProvider
        })
      });

      const payData = await payRes.json();
      if (!payData.success) {
        setPhoneError(payData.error || 'Failed to dispatch payment prompt');
        return;
      }

      setActivePayment(payData.payment);
      setPaymentState('WAITING');
      setPaymentTimeRemaining(60);
      setEnteredPin('');
      setStep('PAYMENT_WAITING');
    } catch (e: any) {
      setPhoneError('Connection error communicating with payment gateway');
    }
  };

  // Step 8: Verify Payment
  const executePaymentVerification = async (simulatedOutcome: 'SUCCESS' | 'REJECTED' | 'TIMEOUT' | 'INSUFFICIENT_FUNDS') => {
    if (!activeOrder) return;

    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: activeOrder.id,
          simulatedOutcome
        })
      });

      const data = await res.json();
      if (data.success && data.paymentStatus === 'PAYMENT_SUCCESS') {
        setPaymentState('SUCCESS');
        setTimeout(() => {
          startDispensingProcess(activeOrder.id);
        }, 1200);
      } else {
        setPaymentState('FAILED');
        setPaymentErrorMessage(data.error || t.paymentFailed);
      }
    } catch (e) {
      setPaymentState('FAILED');
      setPaymentErrorMessage(t.paymentFailed);
    }
  };

  const handlePaymentTimeout = async () => {
    if (!activeOrder) return;
    await executePaymentVerification('TIMEOUT');
  };

  // Step 9: Automatic Drink Dispensing
  const startDispensingProcess = async (orderId: string) => {
    setStep('DISPENSING');
    setDispenseProgress(15);
    setDispenseStageText(t.authorizingDispense);

    try {
      setTimeout(() => {
        setDispenseProgress(40);
        setDispenseStageText('Activating precision continuous-rotation dispenser motor...');
      }, 900);

      setTimeout(() => {
        setDispenseProgress(70);
        setDispenseStageText(t.dispensingProgress);
      }, 1900);

      const res = await fetch('/api/dispense/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });

      const data = await res.json();

      if (data.success) {
        setTimeout(() => {
          setDispenseProgress(95);
          setDispenseStageText('Dual-beam IR drop sensor confirmed beverage received in bin!');
        }, 2800);

        setTimeout(() => {
          setDispenseProgress(100);
          setStep('COMPLETED');
          if (onOrderCompleted) onOrderCompleted();
        }, 3600);
      } else {
        setDispenseError(data.error || 'Dispense mechanism obstruction detected');
      }
    } catch (e: any) {
      setDispenseError('Hardware communication timeout');
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* Dynamic SKOL Fridge Colored Trim & Atmosphere (Yellow, Red, White) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Bold Yellow Glow */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-yellow-400/20 rounded-full blur-[120px]"></div>
        {/* Bold Red Glow */}
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-red-600/25 rounded-full blur-[120px]"></div>
        {/* White Center Highlight */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-white/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Top Header Bar styled with Yellow, Red & White Brand Accents */}
      <header className="relative z-10 px-6 sm:px-8 py-4 border-b-4 border-yellow-400 bg-slate-900/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-xl">
        {/* Branding & Logo */}
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-yellow-400 via-red-500 to-red-600 p-1 shadow-lg shadow-yellow-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[13px] flex items-center justify-center font-black text-red-600 text-xl tracking-tighter">
              SKOL
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white font-mono flex items-center gap-1.5">
                FTM-1 <span className="text-yellow-400 font-extrabold">• SBL</span>
              </h1>
              <span className="px-2.5 py-0.5 text-[11px] font-black bg-red-600 text-white border-2 border-yellow-400 rounded-full shadow-sm">
                {t.solarCooler}
              </span>
            </div>
            <p className="text-xs text-yellow-300 font-semibold">{t.tagline}</p>
          </div>
        </div>

        {/* Live Indicators & Language Selector */}
        <div className="flex items-center flex-wrap gap-3">
          {/* 4-Language Switcher (EN, FR, SW, CH) */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 border-2 border-yellow-400/80 px-2 py-1 rounded-2xl shadow-inner">
            <Globe className="w-4 h-4 text-yellow-400 ml-1" />
            <span className="text-[11px] font-bold text-yellow-300 mr-1 hidden sm:inline">{t.selectLang}:</span>
            {(['en', 'fr', 'sw', 'ch'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setCurrentLang(lang)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentLang === lang
                    ? 'bg-red-600 text-white font-black shadow-md border border-yellow-300'
                    : 'text-slate-300 hover:text-yellow-300 hover:bg-slate-800'
                }`}
                title={lang === 'en' ? 'English' : lang === 'fr' ? 'Français' : lang === 'sw' ? 'Kiswahili' : '中文 (Chinese)'}
              >
                {lang === 'en' ? 'EN' : lang === 'fr' ? 'FR' : lang === 'sw' ? 'SW' : 'CH'}
              </button>
            ))}
          </div>

          {/* README Modal Trigger */}
          <button
            onClick={() => setReadmeModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-black rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 transition-all shadow-md flex items-center gap-1.5 border border-yellow-200"
          >
            <BookOpen className="w-4 h-4 text-red-600" /> {t.readmeGuide}
          </button>

          {/* Fridge Status Badges */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-700 px-3 py-1.5 rounded-full text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-white font-bold">3.8°C</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-700 px-3 py-1.5 rounded-full text-xs">
            <span className="text-yellow-400 font-bold">☀️ 49.6V</span>
          </div>

          {step !== 'WELCOME' && (
            <button
              onClick={resetKiosk}
              className="px-3.5 py-1.5 text-xs font-black bg-red-600/90 hover:bg-red-600 text-white border-2 border-yellow-400 rounded-full transition-all flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> {t.cancel}
            </button>
          )}
        </div>
      </header>

      {/* Main Touchscreen Display */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-6 sm:px-8 py-6 max-w-7xl mx-auto w-full">
        {/* ============================================================ */}
        {/* STEP 1: WELCOME SCREEN (Yellow, Red, White Aesthetic) */}
        {/* ============================================================ */}
        {step === 'WELCOME' && (
          <div className="flex flex-col items-center justify-center text-center my-auto py-6">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-600 text-white border-2 border-yellow-400 text-sm font-black mb-5 shadow-lg shadow-red-600/30 animate-pulse">
              <Sparkles className="w-4 h-4 text-yellow-300" /> {t.solarCooler} • SKOL & VIRUNGA
            </div>

            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-4">
              {t.welcomeTitle}
              <br />
              <span className="bg-gradient-to-r from-yellow-400 via-white to-yellow-300 bg-clip-text text-transparent">
                {t.welcomeSubtitle}
              </span>
            </h2>

            <p className="text-base md:text-lg text-slate-200 max-w-2xl mb-8 leading-relaxed font-medium">
              {t.welcomeDesc}
            </p>

            {/* Showcase the 6 Official Beverages */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 max-w-5xl w-full mb-10">
              {products.slice(0, 6).map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-900/90 border-2 border-slate-800 hover:border-yellow-400 rounded-2xl p-3 text-center shadow-lg transition-all group"
                >
                  <div className="h-32 w-full bg-white rounded-xl overflow-hidden mb-2 p-1.5 flex items-center justify-center">
                    <img 
                      src={p.image_url} 
                      alt={p.product_name}
                      className="max-h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="font-bold text-white text-xs truncate">{p.product_name}</h4>
                  <p className="text-yellow-400 font-black text-sm mt-0.5 font-mono">{p.price.toLocaleString()} RWF</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-block mt-1 ${p.is_alcoholic ? 'bg-red-600/80 text-white' : 'bg-yellow-400/80 text-slate-950'}`}>
                    {p.is_alcoholic ? '18+ Beer' : 'Soft/Water'}
                  </span>
                </div>
              ))}
            </div>

            {/* Big Interactive "TOUCH TO START" Button in Yellow/Red/White */}
            <button
              onClick={() => setStep('AGE_VERIFY')}
              className="group relative inline-flex items-center justify-center px-16 py-6 text-2xl font-black rounded-3xl text-slate-950 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 hover:from-yellow-300 hover:to-white border-4 border-red-600 shadow-2xl shadow-yellow-500/40 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <span className="flex items-center gap-4 text-red-950 font-black tracking-wide">
                {t.touchToStart}
                <ArrowRight className="w-8 h-8 text-red-600 group-hover:translate-x-2 transition-transform" />
              </span>
            </button>
            <p className="text-xs text-slate-400 mt-4 font-mono">{t.kigaliLocation}</p>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: AGE ELIGIBILITY VERIFICATION */}
        {/* ============================================================ */}
        {step === 'AGE_VERIFY' && (
          <div className="max-w-3xl mx-auto my-auto text-center py-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-red-600/20 border-2 border-yellow-400 flex items-center justify-center text-yellow-400 shadow-lg shadow-red-600/20">
              <ShieldCheck className="w-10 h-10 text-yellow-400" />
            </div>

            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
              {t.ageTitle}
            </h2>
            <p className="text-slate-300 text-base max-w-xl mx-auto mb-10 leading-relaxed">
              {t.ageSubtitle}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto mb-8">
              {/* YES 18+ Button (Red with Yellow Border) */}
              <button
                onClick={() => handleAgeChoice(true)}
                className="p-8 rounded-3xl bg-gradient-to-br from-red-700 to-red-900 border-4 border-yellow-400 hover:border-white active:scale-95 transition-all text-left flex flex-col justify-between group shadow-xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-white text-red-600 flex items-center justify-center mb-6 shadow-md">
                  <Wine className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white group-hover:text-yellow-300">
                    {t.ageYes}
                  </h3>
                  <p className="text-xs text-red-100 mt-2 font-medium">
                    {t.ageYesDesc}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-yellow-300 font-black">
                  {t.continueBtn} <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              {/* NO UNDER 18 Button (Yellow with Red Border) */}
              <button
                onClick={() => handleAgeChoice(false)}
                className="p-8 rounded-3xl bg-gradient-to-br from-yellow-400 to-amber-500 border-4 border-red-600 hover:border-white active:scale-95 transition-all text-left flex flex-col justify-between group shadow-xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-white text-yellow-600 flex items-center justify-center mb-6 shadow-md">
                  <GlassWater className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-950 group-hover:text-red-900">
                    {t.ageNo}
                  </h3>
                  <p className="text-xs text-yellow-950 mt-2 font-semibold">
                    {t.ageNoDesc}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-red-900 font-black">
                  {t.continueBtn} <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: DISPLAY 6 OFFICIAL DRINKS */}
        {/* ============================================================ */}
        {step === 'CATALOG' && (
          <div className="flex flex-col h-full py-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  {t.selectBeverage}
                  {isAgeVerified18 === false ? (
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-yellow-400 text-slate-950 border border-yellow-200">
                      {t.nonAlcoholic}
                    </span>
                  ) : (
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-red-600 text-white border border-yellow-400">
                      {t.allDrinks} (18+ Verified)
                    </span>
                  )}
                </h2>
                <p className="text-xs text-yellow-300 font-medium">Chilled at optimal 3.8°C • Direct Solar Powered</p>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border-2 border-slate-800">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${selectedCategory === 'ALL' ? 'bg-yellow-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
                >
                  {t.allDrinks} ({filteredProducts.length})
                </button>
                <button
                  onClick={() => setSelectedCategory('STILL_WATER')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${selectedCategory === 'STILL_WATER' ? 'bg-yellow-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
                >
                  Still Water
                </button>
                <button
                  onClick={() => setSelectedCategory('SPARKLING_WATER')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${selectedCategory === 'SPARKLING_WATER' ? 'bg-yellow-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
                >
                  Sparkling Water
                </button>
                <button
                  onClick={() => setSelectedCategory('PANACHE_LEMON')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${selectedCategory === 'PANACHE_LEMON' ? 'bg-yellow-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
                >
                  Panache Lemon
                </button>
                {isAgeVerified18 !== false && (
                  <button
                    onClick={() => setSelectedCategory('SKOL_LAGER')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${selectedCategory === 'SKOL_LAGER' ? 'bg-yellow-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
                  >
                    SKOL Beers
                  </button>
                )}
              </div>
            </div>

            {/* 6 Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[65vh] pr-2 pb-6">
              {filteredProducts.map((p) => {
                const inStock = (p.available_quantity || 0) > 0;
                return (
                  <div
                    key={p.id}
                    className={`relative bg-slate-900 rounded-3xl border-2 ${inStock ? 'border-yellow-400/70 hover:border-white shadow-xl' : 'border-slate-800 opacity-60'} overflow-hidden flex flex-col justify-between transition-all group`}
                  >
                    {/* Bottle Image with Clean White Backdrop */}
                    <div className="relative h-52 w-full bg-white flex items-center justify-center p-3">
                      <img 
                        src={p.image_url} 
                        alt={p.product_name}
                        className="h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                        {p.is_alcoholic === 1 ? (
                          <span className="px-2.5 py-1 text-[11px] font-black rounded-full bg-red-600 text-white shadow-md">
                            18+ Beer
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-[11px] font-black rounded-full bg-yellow-400 text-slate-950 shadow-md">
                            Non-Alcoholic
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-900/90 text-white">
                          {p.size}
                        </span>
                      </div>
                    </div>

                    {/* Product Details & Selection */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-black text-lg text-white group-hover:text-yellow-400 transition-colors">
                            {p.product_name}
                          </h3>
                          <span className="text-xl font-black text-yellow-400 font-mono whitespace-nowrap">
                            {p.price.toLocaleString()} RWF
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2 mb-4 font-medium">
                          {p.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">
                          {inStock ? (
                            <span className="text-emerald-400 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> {t.inStock} ({p.available_quantity})
                            </span>
                          ) : (
                            <span className="text-red-400 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-red-400"></span> {t.soldOut}
                            </span>
                          )}
                        </span>

                        <button
                          disabled={!inStock}
                          onClick={() => handleSelectProduct(p)}
                          className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all ${
                            inStock
                              ? 'bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-white text-slate-950 shadow-lg shadow-yellow-500/20 active:scale-95 cursor-pointer border border-yellow-200'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {inStock ? t.select : t.soldOut}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 4: SELECTION & QUANTITY MODAL */}
        {/* ============================================================ */}
        {step === 'PRODUCT_MODAL' && selectedProduct && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-slate-900 border-4 border-yellow-400 rounded-3xl max-w-lg w-full p-8 shadow-2xl relative">
              <button
                onClick={() => setStep('CATALOG')}
                className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-5 mb-6">
                <div className="w-24 h-24 bg-white rounded-2xl p-2 flex items-center justify-center border-2 border-yellow-400 shadow-md">
                  <img 
                    src={selectedProduct.image_url} 
                    alt={selectedProduct.product_name}
                    className="max-h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-600 text-white">
                    {selectedProduct.size}
                  </span>
                  <h3 className="text-2xl font-black text-white mt-1">
                    {selectedProduct.product_name}
                  </h3>
                  <p className="text-yellow-400 font-black text-lg font-mono">
                    {selectedProduct.price.toLocaleString()} RWF <span className="text-xs text-slate-400 font-normal">{t.perUnit}</span>
                  </p>
                </div>
              </div>

              {/* Quantity selector */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{t.qtyToDispense}</span>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      disabled={quantity <= 1}
                      className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xl font-black disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-2xl font-black text-yellow-400 font-mono w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(prev => Math.min(selectedProduct.available_quantity || 1, prev + 1))}
                      disabled={quantity >= (selectedProduct.available_quantity || 1)}
                      className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xl font-black disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>{t.availableStock}</span>
                  <span className="font-bold text-white">{selectedProduct.available_quantity} bottles</span>
                </div>
              </div>

              {/* Total Calculation in Yellow/Red styling */}
              <div className="bg-red-950/40 border-2 border-red-500 rounded-2xl p-5 mb-8 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-yellow-400 font-black">{t.totalDue}</p>
                  <p className="text-xs text-slate-300 font-mono">Rwandan Francs (RWF)</p>
                </div>
                <div className="text-3xl font-black text-yellow-300 font-mono">
                  {(selectedProduct.price * quantity).toLocaleString()} RWF
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setStep('CATALOG')}
                  className="py-4 text-xs font-bold rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleProceedToPhone}
                  className="py-4 text-xs font-black rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-white text-slate-950 shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 border border-yellow-200"
                >
                  {t.continueToPay} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 5 & 6: PHONE NUMBER & MTN/AIRTEL METHOD */}
        {/* ============================================================ */}
        {step === 'PHONE_PROVIDER' && selectedProduct && (
          <div className="max-w-4xl mx-auto my-auto w-full py-4">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-black text-white tracking-tight mb-1">
                {t.momoPaymentTitle}
              </h2>
              <p className="text-slate-300 text-xs">
                {quantity}x <span className="text-white font-bold">{selectedProduct.product_name}</span> • Total:{' '}
                <span className="text-yellow-400 font-black font-mono">{(selectedProduct.price * quantity).toLocaleString()} RWF</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Provider Selection & Phone Input */}
              <div className="bg-slate-900 border-2 border-yellow-400/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-black text-yellow-300 uppercase tracking-wider mb-3">
                    {t.selectProvider}
                  </label>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {/* MTN MoMo Button */}
                    <button
                      onClick={() => setPaymentProvider('MTN')}
                      className={`p-4 rounded-2xl border-4 text-left transition-all ${
                        paymentProvider === 'MTN'
                          ? 'border-yellow-400 bg-yellow-400 text-slate-950 shadow-lg'
                          : 'border-slate-800 bg-slate-950 text-white hover:border-slate-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-950 text-yellow-400 font-black text-xs flex items-center justify-center mb-2">
                        MTN
                      </div>
                      <h4 className="font-black text-sm">MTN MoMo</h4>
                      <p className={`text-[11px] mt-0.5 ${paymentProvider === 'MTN' ? 'text-slate-800 font-bold' : 'text-slate-400'}`}>078 / 079</p>
                    </button>

                    {/* Airtel Money Button */}
                    <button
                      onClick={() => setPaymentProvider('AIRTEL')}
                      className={`p-4 rounded-2xl border-4 text-left transition-all ${
                        paymentProvider === 'AIRTEL'
                          ? 'border-red-500 bg-red-600 text-white shadow-lg'
                          : 'border-slate-800 bg-slate-950 text-white hover:border-slate-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-white text-red-600 font-black text-xs flex items-center justify-center mb-2">
                        AIR
                      </div>
                      <h4 className="font-black text-sm">Airtel Money</h4>
                      <p className={`text-[11px] mt-0.5 ${paymentProvider === 'AIRTEL' ? 'text-red-100 font-bold' : 'text-slate-400'}`}>072 / 073</p>
                    </button>
                  </div>

                  <label className="block text-xs font-black text-yellow-300 uppercase tracking-wider mb-2">
                    {t.enterPhone}
                  </label>

                  {/* Quick Prefix Buttons */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] text-slate-400">{t.quickPrefix}</span>
                    <button onClick={() => handleSetPrefix('078')} className="px-2.5 py-1 text-xs font-mono font-bold bg-yellow-400 text-slate-950 rounded-lg">078</button>
                    <button onClick={() => handleSetPrefix('079')} className="px-2.5 py-1 text-xs font-mono font-bold bg-yellow-400 text-slate-950 rounded-lg">079</button>
                    <button onClick={() => handleSetPrefix('072')} className="px-2.5 py-1 text-xs font-mono font-bold bg-red-600 text-white rounded-lg">072</button>
                    <button onClick={() => handleSetPrefix('073')} className="px-2.5 py-1 text-xs font-mono font-bold bg-red-600 text-white rounded-lg">073</button>
                    <button onClick={() => handleSetPrefix('+25078')} className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-800 text-white rounded-lg">+25078</button>
                  </div>

                  <div className="relative mb-2">
                    <input
                      type="text"
                      readOnly
                      value={phoneNumber}
                      placeholder={t.phonePlaceholder}
                      className="w-full bg-slate-950 border-2 border-yellow-400/80 rounded-2xl py-3.5 px-4 text-2xl font-mono font-bold text-yellow-300 tracking-wider focus:outline-none"
                    />
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400" />
                  </div>

                  {phoneError ? (
                    <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1 font-bold">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {phoneError}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-1">
                      {t.phoneFormatHelp}
                    </p>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-800 mt-6 flex items-center gap-3">
                  <button
                    onClick={() => setStep('CATALOG')}
                    className="py-3.5 px-6 text-xs font-bold rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    {t.back}
                  </button>
                  <button
                    onClick={handleInitiatePayment}
                    className="flex-1 py-3.5 text-xs font-black rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-white text-slate-950 shadow-xl shadow-yellow-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 border border-yellow-200"
                  >
                    {t.sendPaymentPrompt} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Keypad */}
              <div className="bg-slate-900 border-2 border-yellow-400/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                <span className="text-xs font-black text-yellow-300 uppercase tracking-wider mb-3">
                  {t.touchKeypad}
                </span>

                <div className="grid grid-cols-3 gap-3 flex-1">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'BACK'].map((key) => (
                    <button
                      key={key}
                      onClick={() => handleKeypadPress(key)}
                      className={`h-14 rounded-2xl text-xl font-mono font-bold transition-all active:scale-90 flex items-center justify-center ${
                        key === 'CLEAR'
                          ? 'bg-red-600/80 text-white text-xs font-black'
                          : key === 'BACK'
                          ? 'bg-slate-800 text-slate-300 text-xs font-bold'
                          : 'bg-slate-950 border border-slate-800 text-white hover:bg-yellow-400 hover:text-slate-950 shadow-md'
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>

                <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2 text-[11px] text-slate-400">
                  <Lock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <span>Rwanda National Payment System (RNPS) Encrypted Push.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 7 & 8: PAYMENT PUSH WAITING & VERIFICATION */}
        {/* ============================================================ */}
        {step === 'PAYMENT_WAITING' && activeOrder && (
          <div className="max-w-4xl mx-auto my-auto w-full py-4">
            <div className="bg-slate-900 border-4 border-yellow-400 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="text-center max-w-xl mx-auto mb-6">
                {paymentState === 'WAITING' ? (
                  <>
                    <div className="relative w-24 h-24 mx-auto mb-5">
                      <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-xl font-mono font-black text-yellow-400">
                        {paymentTimeRemaining}s
                      </div>
                    </div>

                    <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                      {t.paymentRequestSent}
                    </h2>
                    <p className="text-yellow-300 text-base font-bold">
                      {t.checkPhonePrompt}
                    </p>
                    <p className="text-xs text-slate-400 mt-2 font-mono">
                      {t.txRef} <span className="text-white font-bold">{activeOrder.orderReference}</span> • 
                      {t.amount} <span className="font-bold text-yellow-400">{activeOrder.totalAmount.toLocaleString()} RWF</span>
                    </p>
                  </>
                ) : paymentState === 'SUCCESS' ? (
                  <>
                    <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border-4 border-emerald-400">
                      <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                      {t.paymentVerified}
                    </h2>
                    <p className="text-yellow-400 text-sm font-bold">
                      {t.authorizingDispense}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center border-4 border-red-500">
                      <AlertCircle className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight mb-2">
                      {paymentErrorMessage || t.paymentFailed}
                    </h2>
                    <button
                      onClick={() => setStep('PHONE_PROVIDER')}
                      className="px-8 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black shadow-lg"
                    >
                      {t.tryAgain}
                    </button>
                  </>
                )}
              </div>

              {/* Handset USSD Simulator */}
              <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 mt-4">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-bold text-white">
                      {t.ussdTitle} ({phoneNumber})
                    </span>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-600 text-white font-bold font-mono">
                    {paymentProvider}
                  </span>
                </div>

                {paymentState === 'WAITING' ? (
                  <div className="space-y-3">
                    <div className="bg-slate-900 border border-yellow-400/50 p-3 rounded-xl text-left font-mono text-xs">
                      <p className="text-yellow-400 font-bold mb-1">
                        *** {paymentProvider} Mobile Money USSD Prompt ***
                      </p>
                      <p className="text-slate-200">
                        Authorize payment of <strong className="text-yellow-300">{activeOrder.totalAmount} RWF</strong> to <strong className="text-white">FTM-1 Smart Cooler</strong>?
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="PIN: • • • •"
                        value={enteredPin}
                        onChange={(e) => setEnteredPin(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 font-mono text-center text-sm tracking-widest text-white w-full sm:w-44 focus:border-yellow-400 focus:outline-none"
                      />
                      
                      <button
                        onClick={() => executePaymentVerification('SUCCESS')}
                        className="w-full sm:w-auto px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-red-600" /> {t.authorizeSuccess}
                      </button>

                      <button
                        onClick={() => executePaymentVerification('REJECTED')}
                        className="w-full sm:w-auto px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500 font-bold rounded-xl text-xs transition-colors"
                      >
                        {t.rejectBtn}
                      </button>

                      <button
                        onClick={() => executePaymentVerification('INSUFFICIENT_FUNDS')}
                        className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-yellow-300 border border-slate-700 font-bold rounded-xl text-xs transition-colors"
                      >
                        {t.insufficientFunds}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-mono">Session complete. Response recorded in transaction events.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 9: DRINK DISPENSING */}
        {/* ============================================================ */}
        {step === 'DISPENSING' && activeOrder && (
          <div className="max-w-3xl mx-auto my-auto w-full text-center py-8">
            <div className="bg-slate-900 border-4 border-yellow-400 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-red-600/20 border-4 border-yellow-400 flex items-center justify-center text-yellow-400 animate-pulse">
                <Box className="w-12 h-12 text-yellow-400" />
              </div>

              <h2 className="text-4xl font-black text-white tracking-tight mb-2">
                {t.dispensingTitle}
              </h2>
              <p className="text-slate-300 text-base mb-6 font-medium">
                {quantity}x <strong className="text-yellow-400">{selectedProduct?.product_name}</strong>
              </p>

              {/* Progress Bar (Yellow, Red, White) */}
              <div className="w-full bg-slate-950 rounded-full h-5 p-1 border-2 border-yellow-400 mb-6 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-300 h-full rounded-full transition-all duration-500 shadow-md"
                  style={{ width: `${dispenseProgress}%` }}
                ></div>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950 border border-yellow-400/50 text-xs font-mono text-yellow-300">
                <RefreshCw className="w-4 h-4 animate-spin text-yellow-400" />
                <span>{dispenseStageText}</span>
              </div>

              {dispenseError && (
                <div className="mt-6 p-4 rounded-2xl bg-red-950/80 border border-red-500 text-red-200 text-xs font-bold">
                  {dispenseError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 10: CUSTOMER COMPLETION SCREEN */}
        {/* ============================================================ */}
        {step === 'COMPLETED' && (
          <div className="max-w-2xl mx-auto my-auto text-center py-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-yellow-400 text-red-600 border-4 border-white flex items-center justify-center shadow-2xl">
              <CheckCircle2 className="w-14 h-14" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600 text-white border-2 border-yellow-400 text-xs font-black mb-4">
              ORDER {activeOrder?.orderReference || 'FTM-001'} COMPLETED
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              {t.paymentSuccessTitle}
              <br />
              <span className="text-yellow-400">{t.drinkReadyTitle}</span>
            </h2>

            <div className="bg-slate-900 border-4 border-yellow-400 rounded-3xl p-6 max-w-md mx-auto mb-6 shadow-2xl">
              <p className="text-xl font-black text-white mb-2">
                {t.collectDrinkPrompt}
              </p>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {t.collectDrinkDetail}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Receipt: Sent to {phoneNumber}</span>
                <span className="text-yellow-400 font-black">DISPENSED</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-2">
              <button
                onClick={resetKiosk}
                className="px-10 py-3.5 text-xs font-black rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 shadow-lg"
              >
                {t.finishNow}
              </button>
              <p className="text-xs text-slate-400">
                {t.autoReturn} <span className="font-mono text-yellow-400 font-bold">{completionCountdown}s</span>
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Touchscreen Footer */}
      <footer className="relative z-10 px-8 py-3.5 border-t-2 border-yellow-400/60 bg-slate-900/90 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-[11px] font-medium">
          <span>FTM-1 Smart Solar Cooler</span>
          <span>•</span>
          <span className="text-yellow-400 font-bold">Skol Brewery Ltd (SBL)</span>
          <span>•</span>
          <span>MTN & Airtel 100% Cashless</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <button 
            onClick={() => setReadmeModalOpen(true)}
            className="text-yellow-400 hover:underline font-bold cursor-pointer"
          >
            {t.readmeGuide}
          </button>
          <span>•</span>
          <button 
            onClick={onOpenAdmin}
            className="text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {t.adminLogin}
          </button>
          <span>•</span>
          <button 
            onClick={onOpenTech}
            className="text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {t.techPortal}
          </button>
        </div>
      </footer>

      {/* Readme Manual Modal */}
      <ReadmeTableModal 
        isOpen={readmeModalOpen} 
        onClose={() => setReadmeModalOpen(false)} 
      />
    </div>
  );
};
