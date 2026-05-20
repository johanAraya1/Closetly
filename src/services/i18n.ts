import i18next from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  es: {
    translation: {
      welcomeTitle: "Closetly",
      homeSubtitle: "Tu espacio virtual para guardar, explorar y compartir moda.",
      goCloset: "Mi Closet",
      goOutfits: "Outfits",
      goExplore: "Explorar",
      goChat: "Chat",
      goSettings: "Configuración",
      loginTitle: "Iniciar sesión",
      registerTitle: "Crear cuenta",
      emailLabel: "Correo",
      usernameLabel: "Usuario",
      passwordLabel: "Contraseña",
      loginButton: "Entrar",
      registerButton: "Registrar",
      goRegister: "Crear cuenta",
      authError: "Por favor revisa tus datos e inténtalo de nuevo.",
      closetTitle: "Closet",
      closetSubtitle: "Tus prendas privadas y públicas en un solo lugar.",
      addGarment: "Agregar prenda",
      closetEmpty: "Tu closet está vacío. Empieza subiendo una prenda.",
      outfitsTitle: "Outfits",
      outfitsSubtitle: "Organiza tus looks y guarda tus combinaciones favoritas.",
      createOutfit: "Crear outfit",
      outfitsEmpty: "Aún no tienes outfits guardados.",
      exploreTitle: "Explorar",
      exploreSubtitle: "Descubre prendas, perfiles y outfits de la comunidad.",
      exploreFeed: "Ver feed social",
      exploreEmpty: "No hay resultados. Ajusta tus filtros.",
      chatTitle: "Mensajes",
      chatSubtitle: "Conversa con otros usuarios y coordina intercambios.",
      startConversation: "Nueva conversación",
      chatEmpty: "No tienes chats activos.",
      settingsTitle: "Configuración",
      appPreferences: "Preferencias de app",
      darkMode: "Modo oscuro",
      language: "Idioma"
    }
  },
  en: {
    translation: {
      welcomeTitle: "Closetly",
      homeSubtitle: "Your virtual space to save, explore and share fashion.",
      goCloset: "My Closet",
      goOutfits: "Outfits",
      goExplore: "Explore",
      goChat: "Chat",
      goSettings: "Settings",
      loginTitle: "Sign in",
      registerTitle: "Create account",
      emailLabel: "Email",
      usernameLabel: "Username",
      passwordLabel: "Password",
      loginButton: "Login",
      registerButton: "Sign up",
      goRegister: "Create account",
      authError: "Please check your information and try again.",
      closetTitle: "Closet",
      closetSubtitle: "Your private and public garments in one place.",
      addGarment: "Add garment",
      closetEmpty: "Your closet is empty. Start by uploading a garment.",
      outfitsTitle: "Outfits",
      outfitsSubtitle: "Organize your looks and keep favorite combinations.",
      createOutfit: "Create outfit",
      outfitsEmpty: "You have no saved outfits yet.",
      exploreTitle: "Explore",
      exploreSubtitle: "Discover garments, profiles and outfits from the community.",
      exploreFeed: "View feed",
      exploreEmpty: "No results. Adjust your filters.",
      chatTitle: "Messages",
      chatSubtitle: "Chat with other users and coordinate exchanges.",
      startConversation: "New chat",
      chatEmpty: "No active chats yet.",
      settingsTitle: "Settings",
      appPreferences: "App preferences",
      darkMode: "Dark mode",
      language: "Language"
    }
  }
};

export function useInitializeI18n() {
  i18next.use(initReactI18next).init({
    compatibilityJSON: "v3",
    resources,
    lng: "es",
    fallbackLng: "es",
    interpolation: {
      escapeValue: false
    }
  });

  return i18next;
}
