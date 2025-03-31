"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  LineChart,
  Share2,
  FileText,
  ExternalLink,
  Github,
  Zap,
  BookOpen,
  BarChart2,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#E0E0E0] bg-white/90 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and name */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              {/* Custom Logo Image */}
              <div className="flex items-center justify-center">
                <Image 
                  src="/NeuroFeelLogoHorizontal.png" 
                  alt="NeuroFeel Logo" 
                  width={240} 
                  height={240} 
                  className="group-hover:opacity-90 transition-opacity"
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link href="/" passHref>
              <Button
                variant={isActive("/") ? "default" : "ghost"}
                className={`text-sm font-medium transition-all ${
                  isActive("/")
                    ? "bg-[#4464AD] text-white hover:bg-[#2D3142]"
                    : "text-[#424242] hover:text-[#4464AD] hover:bg-[#F5F5F5]"
                }`}
              >
                Home
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-sm font-medium flex items-center text-[#424242] hover:text-[#4464AD] hover:bg-[#F5F5F5]"
                >
                  Frameworks <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-[#E0E0E0] bg-white shadow-md">
                <DropdownMenuLabel className="text-[#2D3142]">Research Frameworks</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#E0E0E0]" />
                <DropdownMenuItem asChild className="focus:bg-[#F5F5F5] focus:text-[#4464AD]">
                  <Link
                    href="/wesad"
                    className="flex items-center cursor-pointer"
                  >
                    <LineChart className="mr-2 h-4 w-4 text-[#4464AD]" />
                    <span>WESAD Personalization</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-[#F5F5F5] focus:text-[#4F8A8B]">
                  <Link
                    href="/cross-dataset"
                    className="flex items-center cursor-pointer"
                  >
                    <Share2 className="mr-2 h-4 w-4 text-[#4F8A8B]" />
                    <span>Cross-Dataset Framework</span>
                  </Link>
                </DropdownMenuItem>
                {/* <DropdownMenuItem asChild className="focus:bg-[#F5F5F5] focus:text-[#7BE495]">
                  <Link
                    href="/demo"
                    className="flex items-center cursor-pointer"
                  >
                    <Zap className="mr-2 h-4 w-4 text-[#7BE495]" />
                    <span>Interactive Demo</span>
                    <Badge className="ml-2 bg-[#F5F5F5] text-[#4464AD] text-xs border-[#B8B8FF]/50">New</Badge>
                  </Link>
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-sm font-medium flex items-center text-[#424242] hover:text-[#4464AD] hover:bg-[#F5F5F5]"
                >
                  Resources <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-[#E0E0E0] bg-white shadow-md">
                <DropdownMenuLabel className="text-[#2D3142]">Documentation & Code</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#E0E0E0]" />
                <DropdownMenuItem asChild className="focus:bg-[#F5F5F5] focus:text-[#4464AD]">
                  <Link
                    href="/documentation"
                    className="flex items-center cursor-pointer"
                  >
                    <FileText className="mr-2 h-4 w-4 text-[#4464AD]" />
                    <span>Documentation</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="focus:bg-[#F5F5F5] focus:text-[#4F8A8B]"
                  asChild
                >
                  <a
                    href="https://github.com/HimashaHerath/NeuroFeel"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="mr-2 h-4 w-4 text-[#4F8A8B]" />
                    <span>GitHub Repository</span>
                    <ExternalLink className="ml-auto h-3 w-3 text-[#E0E0E0]" />
                  </a>
                </DropdownMenuItem>
                {/* <DropdownMenuItem asChild className="focus:bg-[#F5F5F5] focus:text-[#7BE495]">
                  <Link
                    href="/api"
                    className="flex items-center cursor-pointer"
                  >
                    <BookOpen className="mr-2 h-4 w-4 text-[#7BE495]" />
                    <span>API Reference</span>
                  </Link>
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/about-us" passHref>
              <Button
                variant={isActive("/about-us") ? "default" : "ghost"}
                className={`text-sm font-medium transition-all ${
                  isActive("/about-us")
                    ? "bg-[#4464AD] text-white hover:bg-[#2D3142]"
                    : "text-[#424242] hover:text-[#4464AD] hover:bg-[#F5F5F5]"
                }`}
              >
                About
              </Button>
            </Link>
          </div>

          {/* Demo Button */}
          <div className="hidden md:flex">
            <Button 
              size="sm" 
              className="ml-4 bg-[#4F8A8B] hover:bg-[#2D3142] text-white transition-colors shadow-sm hover:shadow-md" 
              asChild
            >
              <Link href="/demo" className="flex items-center">
                <Zap className="mr-1.5 h-3.5 w-3.5" />
                Try Demo
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-[#2D3142] hover:bg-[#F5F5F5]">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] border-l border-[#E0E0E0] p-0">
                <div className="bg-gradient-to-r from-[#2D3142] to-[#4464AD] text-white p-6">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="text-white">
                      <div className="flex items-center space-x-2">
                        {/* Custom Logo in mobile menu */}
                        <div className="flex items-center justify-center">
                          <Image 
                            src="/NeuroFeelLogo.png" 
                            alt="NeuroFeel Logo" 
                            width={36} 
                            height={36} 
                          />
                        </div>
                        <span className="font-bold text-xl">NeuroFeel</span>
                      </div>
                    </SheetTitle>
                    <SheetDescription className="text-[#E0E0E0]">
                      Cross-Dataset Emotion Recognition Framework
                    </SheetDescription>
                  </SheetHeader>
                </div>
                
                <div className="p-4">
                  <div className="flex flex-col space-y-2">
                    <SheetClose asChild>
                      <Link href="/">
                        <Button
                          variant={isActive("/") ? "default" : "ghost"}
                          className={`w-full justify-start text-lg ${
                            isActive("/")
                              ? "bg-[#4464AD] text-white hover:bg-[#2D3142]"
                              : "text-[#424242] hover:text-[#4464AD] hover:bg-[#F5F5F5]"
                          }`}
                        >
                          Home
                        </Button>
                      </Link>
                    </SheetClose>

                    <div className="px-3 py-2">
                      <h4 className="text-sm font-medium text-[#4464AD] mb-2 uppercase tracking-wider">
                        Frameworks
                      </h4>
                      <div className="flex flex-col space-y-1 pl-2">
                        <SheetClose asChild>
                          <Link href="/wesad">
                            <Button
                              variant={isActive("/wesad") ? "default" : "ghost"}
                              className={`w-full justify-start ${
                                isActive("/wesad")
                                  ? "bg-[#4464AD] text-white"
                                  : "text-[#424242] hover:text-[#4464AD] hover:bg-[#F5F5F5]"
                              }`}
                            >
                              <LineChart className="mr-2 h-4 w-4 text-[#4464AD]" />
                              WESAD Personalization
                            </Button>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/cross-dataset">
                            <Button
                              variant={
                                isActive("/cross-dataset") ? "default" : "ghost"
                              }
                              className={`w-full justify-start ${
                                isActive("/cross-dataset")
                                  ? "bg-[#4F8A8B] text-white"
                                  : "text-[#424242] hover:text-[#4F8A8B] hover:bg-[#F5F5F5]"
                              }`}
                            >
                              <Share2 className="mr-2 h-4 w-4 text-[#4F8A8B]" />
                              Cross-Dataset Framework
                            </Button>
                          </Link>
                        </SheetClose>
                        
                      </div>
                    </div>

                    <div className="px-3 py-2">
                      <h4 className="text-sm font-medium text-[#4F8A8B] mb-2 uppercase tracking-wider">
                        Resources
                      </h4>
                      <div className="flex flex-col space-y-1 pl-2">
                        <SheetClose asChild>
                          <Link href="/documentation">
                            <Button
                              variant={
                                isActive("/documentation") ? "default" : "ghost"
                              }
                              className={`w-full justify-start ${
                                isActive("/documentation")
                                  ? "bg-[#4464AD] text-white"
                                  : "text-[#424242] hover:text-[#4464AD] hover:bg-[#F5F5F5]"
                              }`}
                            >
                              <FileText className="mr-2 h-4 w-4 text-[#4464AD]" />
                              Documentation
                            </Button>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <a
                            href="https://github.com/HimashaHerath/NeuroFeel"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full"
                          >
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-[#424242] hover:text-[#4F8A8B] hover:bg-[#F5F5F5]"
                            >
                              <Github className="mr-2 h-4 w-4 text-[#4F8A8B]" />
                              GitHub Repository
                              <ExternalLink className="ml-2 h-3 w-3" />
                            </Button>
                          </a>
                        </SheetClose>
                      </div>
                    </div>

                    <SheetClose asChild>
                      <Link href="/about-us">
                        <Button
                          variant={isActive("/about-us") ? "default" : "ghost"}
                          className={`w-full justify-start text-lg ${
                            isActive("/about-us")
                              ? "bg-[#4464AD] text-white hover:bg-[#2D3142]"
                              : "text-[#424242] hover:text-[#4464AD] hover:bg-[#F5F5F5]"
                          }`}
                        >
                          <UserCheck className="mr-2 h-5 w-5" />
                          About
                        </Button>
                      </Link>
                    </SheetClose>

                    <div className="pt-4">
                      <SheetClose asChild>
                        <Link href="/demo">
                          <Button className="w-full bg-gradient-to-r from-[#4464AD] to-[#4F8A8B] hover:from-[#2D3142] hover:to-[#2D3142] text-white shadow-md flex items-center justify-center">
                            <Zap className="mr-2 h-4 w-4" />
                            Try Interactive Demo
                          </Button>
                        </Link>
                      </SheetClose>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;