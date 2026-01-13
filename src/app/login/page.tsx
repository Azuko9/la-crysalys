import type { Metadata } from "next";
import LoginClientPage from "./LoginClientPage";

export const metadata: Metadata = {
  title: "Accès Admin - La Crysalys",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Login() {
  return (
    <LoginClientPage />
  );
}