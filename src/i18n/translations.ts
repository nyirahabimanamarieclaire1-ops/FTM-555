export type Language = 'en' | 'fr' | 'sw' | 'ch';

export interface Translations {
  appName: string;
  solarCooler: string;
  tagline: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  welcomeDesc: string;
  touchToStart: string;
  kigaliLocation: string;
  ageTitle: string;
  ageSubtitle: string;
  ageYes: string;
  ageYesDesc: string;
  ageNo: string;
  ageNoDesc: string;
  continueBtn: string;
  selectBeverage: string;
  allDrinks: string;
  inStock: string;
  soldOut: string;
  select: string;
  perUnit: string;
  qtyToDispense: string;
  availableStock: string;
  totalDue: string;
  cancel: string;
  continueToPay: string;
  momoPaymentTitle: string;
  selectProvider: string;
  enterPhone: string;
  quickPrefix: string;
  phonePlaceholder: string;
  phoneFormatHelp: string;
  sendPaymentPrompt: string;
  back: string;
  touchKeypad: string;
  paymentRequestSent: string;
  checkPhonePrompt: string;
  txRef: string;
  amount: string;
  paymentVerified: string;
  authorizingDispense: string;
  paymentFailed: string;
  paymentExpired: string;
  tryAgain: string;
  dispensingTitle: string;
  dispensingProgress: string;
  paymentSuccessTitle: string;
  drinkReadyTitle: string;
  collectDrinkPrompt: string;
  collectDrinkDetail: string;
  finishNow: string;
  autoReturn: string;
  adminLogin: string;
  techPortal: string;
  readmeGuide: string;
  selectLang: string;
  nonAlcoholic: string;
  alcoholic18: string;
  currency: string;
  ussdTitle: string;
  enterPin: string;
  authorizeSuccess: string;
  rejectBtn: string;
  insufficientFunds: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'FTM-1 Fridge Teller Machine',
    solarCooler: 'SMART SOLAR VENDING COOLER',
    tagline: 'Automated Beverage Teller Machine • Rwanda & East Africa',
    welcomeTitle: 'WELCOME TO FTM-1!',
    welcomeSubtitle: 'FRIDGE TELLER MACHINE',
    welcomeDesc: 'Grab cold Virunga volcanic spring waters, sparkling refreshments, and chilled SKOL beverages at 3.8°C. Pay instantly with MTN Mobile Money or Airtel Money.',
    touchToStart: 'TOUCH TO START',
    kigaliLocation: 'Kigali City Market Entrance Hub • Machine ID: FTM-RW-KGL-001',
    ageTitle: 'ARE YOU 18 YEARS OLD OR ABOVE?',
    ageSubtitle: 'Rwanda Law mandates age verification for alcoholic beverages. Customers under 18 can choose our full selection of pure waters and sodas.',
    ageYes: 'YES, I AM 18 OR ABOVE',
    ageYesDesc: 'Browse all products including SKOL beers, malts, lagers, and natural spring waters.',
    ageNo: 'NO, I AM UNDER 18',
    ageNoDesc: 'Alcohol restricted. Browse pure Virunga Still, Sparkling water, and Panache Lemon.',
    continueBtn: 'Continue',
    selectBeverage: 'SELECT YOUR BEVERAGE',
    allDrinks: 'All 6 Products',
    inStock: 'In Stock',
    soldOut: 'Sold Out',
    select: 'SELECT',
    perUnit: 'per unit',
    qtyToDispense: 'Quantity to Dispense:',
    availableStock: 'Available Stock in Cooler:',
    totalDue: 'Total Amount Due',
    cancel: 'Cancel',
    continueToPay: 'PROCEED TO PAYMENT',
    momoPaymentTitle: 'MOBILE MONEY CHECKOUT',
    selectProvider: 'STEP 1: SELECT PAYMENT PROVIDER',
    enterPhone: 'STEP 2: ENTER MOBILE MONEY NUMBER',
    quickPrefix: 'Quick Prefix:',
    phonePlaceholder: '07XXXXXXXX',
    phoneFormatHelp: 'Rwandan 10-digit mobile number format e.g. 0788123456',
    sendPaymentPrompt: 'SEND PAYMENT PROMPT',
    back: 'BACK',
    touchKeypad: 'Touch Numeric Keypad',
    paymentRequestSent: 'PAYMENT REQUEST SENT!',
    checkPhonePrompt: 'PLEASE CHECK YOUR PHONE AND ENTER YOUR PIN TO AUTHORIZE.',
    txRef: 'Transaction Ref:',
    amount: 'Amount:',
    paymentVerified: 'PAYMENT CONFIRMED!',
    authorizingDispense: 'Authorizing mechanical dispensing actuator...',
    paymentFailed: 'PAYMENT FAILED. PLEASE TRY AGAIN.',
    paymentExpired: 'PAYMENT REQUEST EXPIRED.',
    tryAgain: 'TRY AGAIN',
    dispensingTitle: 'DISPENSING YOUR BEVERAGE...',
    dispensingProgress: 'Beverage traversing gravity chute into secure retrieval bay...',
    paymentSuccessTitle: 'PAYMENT SUCCESSFUL!',
    drinkReadyTitle: 'YOUR DRINK IS READY.',
    collectDrinkPrompt: 'PLEASE COLLECT YOUR DRINK',
    collectDrinkDetail: 'Reach into the dedicated lower collection opening. Enjoy your ice-cold refreshment!',
    finishNow: 'FINISH & CLOSE',
    autoReturn: 'Auto-returning to welcome screen in',
    adminLogin: 'Administrator Access',
    techPortal: 'Technician Diagnostics',
    readmeGuide: 'README & System Manual',
    selectLang: 'Language',
    nonAlcoholic: 'Non-Alcoholic',
    alcoholic18: '18+ Alcoholic',
    currency: 'RWF',
    ussdTitle: 'Subscriber Handset USSD Simulator',
    enterPin: 'Enter Mobile Money PIN:',
    authorizeSuccess: 'AUTHORIZE PAYMENT (SUCCESS)',
    rejectBtn: 'REJECT / CANCEL',
    insufficientFunds: 'INSUFFICIENT FUNDS'
  },
  fr: {
    appName: 'FTM-1 Distributeur Réfrigéré',
    solarCooler: 'GLACIÈRE SOLAIRE INTELLIGENTE',
    tagline: 'Distributeur Automatique de Boissons • Rwanda & Afrique de l’Est',
    welcomeTitle: 'BIENVENUE SUR FTM-1!',
    welcomeSubtitle: 'DISTRIBUTEUR RÉFRIGÉRÉ INTELLIGENT',
    welcomeDesc: 'Boissons fraîches Virunga et bières SKOL rafraîchies à 3.8°C. Payez directement via MTN Mobile Money ou Airtel Money.',
    touchToStart: 'TOUCHER POUR COMMENCER',
    kigaliLocation: 'Entrée Marché de Kigali • ID Machine: FTM-RW-KGL-001',
    ageTitle: 'AVEZ-VOUS 18 ANS OU PLUS?',
    ageSubtitle: 'La loi rwandaise exige la vérification de l’âge pour les boissons alcoolisées. Les personnes de moins de 18 ans peuvent choisir nos eaux et sodas.',
    ageYes: 'OUI, J’AI 18 ANS OU PLUS',
    ageYesDesc: 'Accédez à tout le catalogue : bières SKOL, Virunga Silver et eaux minérales.',
    ageNo: 'NON, J’AI MOINS DE 18 ANS',
    ageNoDesc: 'Alcool bloqué. Choisissez parmi les eaux de source Virunga et Panache Citron.',
    continueBtn: 'Continuer',
    selectBeverage: 'CHOISISSEZ VOTRE BOISSON',
    allDrinks: 'Toutes les Boissons',
    inStock: 'En Stock',
    soldOut: 'Épuisé',
    select: 'CHOISIR',
    perUnit: 'l’unité',
    qtyToDispense: 'Quantité à Distribuer:',
    availableStock: 'Stock Disponible dans la Glacière:',
    totalDue: 'Montant Total',
    cancel: 'Annuler',
    continueToPay: 'CONTINUER VERS LE PAIEMENT',
    momoPaymentTitle: 'PAIEMENT MOBILE MONEY',
    selectProvider: 'ÉTAPE 1: CHOISISSEZ L’OPÉRATEUR',
    enterPhone: 'ÉTAPE 2: NUMÉRO DE TÉLÉPHONE',
    quickPrefix: 'Préfixes:',
    phonePlaceholder: '07XXXXXXXX',
    phoneFormatHelp: 'Format rwandais à 10 chiffres (ex: 0788123456)',
    sendPaymentPrompt: 'ENVOYER LA DEMANDE DE PAIEMENT',
    back: 'RETOUR',
    touchKeypad: 'Clavier Tactile',
    paymentRequestSent: 'DEMANDE DE PAIEMENT ENVOYÉE!',
    checkPhonePrompt: 'VEUILLEZ VÉRIFIER VOTRE TÉLÉPHONE ET ENTRER VOTRE CODE PIN.',
    txRef: 'Réf. Transaction:',
    amount: 'Montant:',
    paymentVerified: 'PAIEMENT CONFIRMÉ!',
    authorizingDispense: 'Autorisation du mécanisme de distribution...',
    paymentFailed: 'PAIEMENT ÉCHOUÉ. VEUILLEZ RÉESSAYER.',
    paymentExpired: 'DEMANDE DE PAIEMENT EXPIRÉE.',
    tryAgain: 'RÉESSAYER',
    dispensingTitle: 'DISTRIBUTION EN COURS...',
    dispensingProgress: 'La bouteille descend dans le bac de récupération sécurisé...',
    paymentSuccessTitle: 'PAIEMENT RÉUSSI!',
    drinkReadyTitle: 'VOTRE BOISSON EST PRÊTE.',
    collectDrinkPrompt: 'VEUILLEZ RÉCUPÉRER VOTRE BOISSON',
    collectDrinkDetail: 'Prenez votre boisson fraîche dans l’ouverture inférieure. Merci d’utiliser FTM-1!',
    finishNow: 'TERMINER',
    autoReturn: 'Retour automatique à l’accueil dans',
    adminLogin: 'Connexion Administrateur',
    techPortal: 'Diagnostics Technicien',
    readmeGuide: 'Manuel Système (README)',
    selectLang: 'Langue',
    nonAlcoholic: 'Sans Alcool',
    alcoholic18: '18+ Alcoolisé',
    currency: 'RWF',
    ussdTitle: 'Simulateur USSD Téléphone Client',
    enterPin: 'Entrez le code PIN Mobile Money:',
    authorizeSuccess: 'AUTORISER LE PAIEMENT (SUCCÈS)',
    rejectBtn: 'REFUSER / ANNULER',
    insufficientFunds: 'SOLDE INSUFFISANT'
  },
  sw: {
    appName: 'Mashine ya Vinywaji FTM-1',
    solarCooler: 'JOKOFU MAALUM YA JUA YA VINYWAJI',
    tagline: 'Huduma ya Kujihudumia Vinywaji Baridi • Rwanda na Afrika Mashariki',
    welcomeTitle: 'KARIBU KWENYE FTM-1!',
    welcomeSubtitle: 'MASHINE YA JOKOFU YA TELLER',
    welcomeDesc: 'Chukua maji baridi ya volkano ya Virunga na vinywaji vya SKOL vilivyopozwa hadi 3.8°C. Lipa kwa urahisi kupitia MTN Mobile Money au Airtel Money.',
    touchToStart: 'GUSA ILI KUANZA',
    kigaliLocation: 'Soko Kuu la Kigali • Nambari ya Mashine: FTM-RW-KGL-001',
    ageTitle: 'JE, UNA UMRI WA MIAKA 18 AU ZAIDI?',
    ageSubtitle: 'Sheria ya Rwanda inahitaji uthibitisho wa umri kwa vinywaji vya pombe. Wateja walio chini ya miaka 18 wanaweza kuchagua maji na soda.',
    ageYes: 'NDIYO, NINA UMRI WA MIAKA 18+',
    ageYesDesc: 'Tazama vinywaji vyote ikiwa ni pamoja na bia za SKOL, Virunga Silver na maji ya asili.',
    ageNo: 'HAPANA, NIKO CHINI YA MIAKA 18',
    ageNoDesc: 'Pombe imezuiwa. Tazama maji safi ya Virunga na Panache Lemon tu.',
    continueBtn: 'Endelea',
    selectBeverage: 'CHAGUA KINYWAJI CHAKO',
    allDrinks: 'Vinywaji Vyote 6',
    inStock: 'Vipo Stoo',
    soldOut: 'Vimekwisha',
    select: 'CHAGUA',
    perUnit: 'kwa chupa',
    qtyToDispense: 'Idadi ya Chupa:',
    availableStock: 'Vilivyopo Jokofuni:',
    totalDue: 'Jumla ya Malipo',
    cancel: 'Ghairi',
    continueToPay: 'ENDELEA KULIPA',
    momoPaymentTitle: 'MALIPO YA MOBILE MONEY',
    selectProvider: 'HATUA YA 1: CHAGUA MTANDAO WA MALIPO',
    enterPhone: 'HATUA YA 2: WEKA NAMBARI YAKO YA SIMU',
    quickPrefix: 'Anza na:',
    phonePlaceholder: '07XXXXXXXX',
    phoneFormatHelp: 'Nambari ya simu ya Rwanda yenye tarakimu 10 (mfano: 0788123456)',
    sendPaymentPrompt: 'TUMA OMBI LA MALIPO',
    back: 'RUDI',
    touchKeypad: 'Kibodi ya Nambari',
    paymentRequestSent: 'OMBI LA MALIPO LIMETUMWA!',
    checkPhonePrompt: 'TAFADHALI ANGALIA SIMU YAKO NA UWEKE PIN ILI KUTHIBITISHA.',
    txRef: 'Kumbukumbu ya Malipo:',
    amount: 'Kiasi:',
    paymentVerified: 'MALIPO YAMETHIBITISHWA!',
    authorizingDispense: 'Mashine inatoa kinywaji chako sasa...',
    paymentFailed: 'MALIPO YAMESHINDIKANA. JARIBU TENA.',
    paymentExpired: 'MUDA WA MALIPO UMEISHA.',
    tryAgain: 'JARIBU TENA',
    dispensingTitle: 'KINYWAJI CHAKO KINATOLEWA...',
    dispensingProgress: 'Chupa inashuka kwenye nafasi maalum ya kuchukulia...',
    paymentSuccessTitle: 'MALIPO YAMEFANIKIWA!',
    drinkReadyTitle: 'KINYWAJI CHAKO KIKO TAYARI.',
    collectDrinkPrompt: 'CHUKUA KINYWAJI CHAKO CHINI',
    collectDrinkDetail: 'Ingiza mkono wako kwenye nafasi ya chini uchukue kinywaji chako baridi. Asante kwa kutumia FTM-1!',
    finishNow: 'MALIZA / RUDI MWANZO',
    autoReturn: 'Kurudi ukurasa mkuu baada ya sekunde',
    adminLogin: 'Ingia kama Msimamizi (Admin)',
    techPortal: 'Uchunguzi wa Kiufundi',
    readmeGuide: 'Mwongozo wa Mashine (README)',
    selectLang: 'Lugha',
    nonAlcoholic: 'Haina Pombe',
    alcoholic18: '18+ Ina Pombe',
    currency: 'RWF',
    ussdTitle: 'Kiigaji cha USSD Simu ya Mteja',
    enterPin: 'Weka PIN ya Mobile Money:',
    authorizeSuccess: 'THIBITISHA MALIPO (NDIYO)',
    rejectBtn: 'KATAA / GHAIRI',
    insufficientFunds: 'SALIO HALITOSHI'
  },
  ch: {
    appName: 'FTM-1 智能冰箱取饮机',
    solarCooler: '智能太阳能自动售饮冷柜',
    tagline: '无人值守自动冷饮售卖系统 • 卢旺达与东非',
    welcomeTitle: '欢迎使用 FTM-1！',
    welcomeSubtitle: '智能太阳能取饮机',
    welcomeDesc: '选购冰镇至3.8°C的维龙加（Virunga）纯净火山泉水及SKOL精酿啤酒。支持卢旺达 MTN MoMo 与 Airtel 移动钱包闪电支付。',
    touchToStart: '点击屏幕开始购买',
    kigaliLocation: '基加利市中心市场入口 • 设备编号: FTM-RW-KGL-001',
    ageTitle: '请确认您是否已年满18周岁？',
    ageSubtitle: '卢旺达法律严格限制向未成年人售卖含酒精饮料。未满18周岁顾客可购买天然矿泉水与柠檬气泡饮料。',
    ageYes: '是，我已年满18周岁',
    ageYesDesc: '浏览全部饮品，包括SKOL啤酒、麦芽精酿和火山天然泉水。',
    ageNo: '否，我未满18周岁',
    ageNoDesc: '酒类已被屏蔽，仅展示维龙加泉水及Panache柠檬饮品。',
    continueBtn: '继续',
    selectBeverage: '请挑选您心仪的冰镇饮品',
    allDrinks: '全部6款饮品',
    inStock: '有现货',
    soldOut: '已售罄',
    select: '选择购买',
    perUnit: '每瓶/罐',
    qtyToDispense: '购买数量：',
    availableStock: '冷柜当前现货：',
    totalDue: '应付总金额',
    cancel: '取消',
    continueToPay: '前往移动支付',
    momoPaymentTitle: '移动钱包支付 (Mobile Money)',
    selectProvider: '第一步：请选择您的支付运营商',
    enterPhone: '第二步：输入您的手机钱包号码',
    quickPrefix: '快速前缀：',
    phonePlaceholder: '07XXXXXXXX',
    phoneFormatHelp: '卢旺达10位手机号格式（如：0788123456）',
    sendPaymentPrompt: '发送手机付款提醒',
    back: '返回上一步',
    touchKeypad: '数字触摸键盘',
    paymentRequestSent: '付款提醒已推送到您的手机！',
    checkPhonePrompt: '请在手机弹出的USSD窗口中输入您的钱包密码确认扣款。',
    txRef: '交易流水号：',
    amount: '扣款金额：',
    paymentVerified: '支付验证成功！',
    authorizingDispense: '正在驱动出饮电机与安全锁...',
    paymentFailed: '支付失败，请检查余额并重试。',
    paymentExpired: '付款请求超时已取消。',
    tryAgain: '重新尝试',
    dispensingTitle: '饮品正在出柜中...',
    dispensingProgress: '红外光电对射传感器已检测到饮品滑入取饮舱...',
    paymentSuccessTitle: '支付成功！',
    drinkReadyTitle: '您的饮品已出柜。',
    collectDrinkPrompt: '请在下方取饮口领取您的饮品',
    collectDrinkDetail: '伸手轻推下方取物门即可取出冰镇饮品。感谢使用FTM-1！',
    finishNow: '完成并返回首页',
    autoReturn: '秒后自动返回欢迎页面',
    adminLogin: '管理员入口 (Admin)',
    techPortal: '技术员诊断维护',
    readmeGuide: '系统技术与操作手册 (README)',
    selectLang: '语言 / Language',
    nonAlcoholic: '非酒精类饮品',
    alcoholic18: '18+ 含酒精饮品',
    currency: '卢旺达法郎 (RWF)',
    ussdTitle: '顾客手机 USSD 推送模拟面板',
    enterPin: '输入移动钱包 PIN 码：',
    authorizeSuccess: '授权支付 (模拟成功扣款)',
    rejectBtn: '拒绝/取消支付',
    insufficientFunds: '余额不足'
  }
};
