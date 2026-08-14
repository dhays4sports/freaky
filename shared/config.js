/* Paste your Formspree endpoint below, then upload this entire package. */
window.LANDING_PAGE_CONFIG = {
  // Primary browser transport stays same-origin so Safari/content blockers/CORS
  // cannot strand the final submit before the request reaches Cloudflare.
  leadProxyEndpoint: "/api/lead",
  // Direct Formspree destination remains available as the native no-JavaScript fallback.
  formEndpoint: "https://formspree.io/f/mojgnegn",
  coverageFitTransitionUrl: "https://coveragefit.com/transition/",
  coverageFitHomeUrl: "https://coveragefit.com/home/",
  coverageFitFallbackUrl: "/home#form",
  referralBridgeUrl: "https://408farmers.com/neighbor/",
  // Browser key for Google Places address suggestions. Keep this key restricted
  // in Google Cloud to the 408FARMERS production and approved preview domains.
  googlePlacesApiKey: "AIzaSyBo3AnNYEAc5ZuAZWG1UMN_-z1I-LGRGr4"
};
