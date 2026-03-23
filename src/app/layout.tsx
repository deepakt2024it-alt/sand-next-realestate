import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "San D — Real Estate Marketplace",
  description: "Tamil Nadu's trusted B2B real estate marketplace for buying and selling verified land, plots, and houses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <footer className="bg-slate-900 text-slate-300 py-12">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="text-2xl font-bold text-white mb-3">
                🏡 San <span className="text-teal-400">D</span>
              </div>
              <p className="text-sm text-slate-400">
                Tamil Nadu&apos;s trusted B2B real estate marketplace.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Browse</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/properties?type=PLOT" className="hover:text-teal-400 transition">Plots</a></li>
                <li><a href="/properties?type=LAND" className="hover:text-teal-400 transition">Land</a></li>
                <li><a href="/properties?type=HOUSE" className="hover:text-teal-400 transition">Houses</a></li>
                <li><a href="/properties?type=COMMERCIAL" className="hover:text-teal-400 transition">Commercial</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/auth/register" className="hover:text-teal-400 transition">Register</a></li>
                <li><a href="/auth/login" className="hover:text-teal-400 transition">Login</a></li>
                <li><a href="/dashboard" className="hover:text-teal-400 transition">Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-teal-400 transition">Help Center</a></li>
                <li><a href="#" className="hover:text-teal-400 transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-teal-400 transition">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-slate-700 text-center text-sm text-slate-500">
            © 2025 San D Real Estate · Built for Tamil Nadu 🌐
          </div>
        </footer>
      </body>
    </html>
  );
}
