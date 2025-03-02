"use client";

import { useState, useEffect } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activePage, setActivePage] = useState("Home");

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const menuItems = ["Home", "All Manga", "Genre", "Recomendation"];

  return (
    <Disclosure
      as="nav"
      className={`fixed top-0 left-0 w-full transition-transform duration-300 ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      } bg-[#0a0d14]/80 backdrop-blur-sm shadow-lg z-20`}
    >
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              {/* Logo */}
              <div className="flex shrink-0 items-center">
                <h1 className="text-xl font-bold text-white lg:text-2xl">
                  <span className="lg:hidden">MM</span>
                  <span className="hidden lg:block">MOCO MANGA</span>
                </h1>
              </div>

              {/* Nav Items (Desktop) - Centered */}
              <div className="hidden lg:block lg:w-2/4">
                <div className="flex justify-center space-x-8">
                  {menuItems.map((item) => (
                    <a
                      key={item}
                      href="#"
                      onClick={() => setActivePage(item)}
                      aria-current={activePage === item ? "page" : undefined}
                      className={`relative inline-flex items-center px-1 pt-1 text-lg font-medium transition-all duration-300 ${
                        activePage === item
                          ? "text-white before:scale-x-100"
                          : "text-gray-400 hover:text-white before:scale-x-0"
                      } before:absolute before:bottom-0 before:left-0 before:h-[3px] before:w-full before:bg-gradient-to-r before:from-purple-500 before:to-blue-500 before:transition-transform before:duration-300 before:origin-left hover:before:scale-x-100`}
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>

              {/* Search Bar - Visible on both mobile and desktop, with improved spacing */}
              <div className="flex w-full max-w-[60%] sm:max-w-xs ml-4 mr-2 lg:ml-0 lg:mr-0 lg:w-1/4 lg:justify-end">
                <div className="w-full relative">
                  <input
                    name="search"
                    type="search"
                    placeholder="Cari Manga"
                    className="block w-full rounded-md bg-gray-800/80 py-1.5 pr-3 pl-10 text-base text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <MagnifyingGlassIcon
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-gray-400"
                  />
                </div>
              </div>

              {/* Mobile Menu Button */}
              <div className="flex items-center lg:hidden">
                <DisclosureButton className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-inset">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon aria-hidden="true" className="size-6" />
                  ) : (
                    <Bars3Icon aria-hidden="true" className="size-6" />
                  )}
                </DisclosureButton>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <DisclosurePanel className="lg:hidden bg-[#05080f]/90 backdrop-blur-sm">
            <div className="space-y-1 pt-2 pb-3">
              {menuItems.map((item) => (
                <DisclosureButton
                  key={item}
                  as="a"
                  href="#"
                  onClick={() => setActivePage(item)}
                  aria-current={activePage === item ? "page" : undefined}
                  className={`block py-2 pr-4 pl-3 text-base font-medium transition-all duration-300 ${
                    activePage === item
                      ? "relative text-white bg-[#161b2e]/50 border-l-0 before:content-[''] before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-gradient-to-b before:from-purple-500 before:to-blue-500"
                      : "border-transparent text-gray-400 hover:text-white hover:border-l-0 hover:bg-[#0a0d14]/50 relative hover:before:content-[''] hover:before:absolute hover:before:top-0 hover:before:left-0 hover:before:w-1 hover:before:h-full hover:before:bg-gradient-to-b hover:before:from-purple-500/50 hover:before:to-blue-500/50"
                  }`}
                >
                  {item}
                </DisclosureButton>
              ))}
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}
