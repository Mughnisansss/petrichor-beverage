
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, AlertTriangle, KeyRound, UserPlus, Crown, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/AppContext";
import { loadStripe } from '@stripe/stripe-js';

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Kata sandi tidak boleh kosong"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const registerSchema = z.object({
  storeName: z.string().min(2, "Nama toko harus memiliki setidaknya 2 karakter"),
  name: z.string().min(2, "Nama harus memiliki setidaknya 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Konfirmasi kata sandi tidak cocok",
  path: ["confirmPassword"], // path of error
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,35.853,44,30.342,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);

// Initialize Stripe.js with the publishable key.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function AkunPengaturanPage() {
    const { user, login, logout, register, isLoading } = useAppContext();
    const { toast } = useToast();
    const [isRegisterOpen, setRegisterOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loginForm = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const registerForm = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { storeName: "", name: "", email: "", password: "", confirmPassword: "" },
    });

    const handleAction = async (action: () => Promise<any>, successTitle: string, successDesc: string, errorTitle: string) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await action();
            toast({ title: successTitle, description: successDesc });
        } catch(error) {
            toast({ title: errorTitle, description: (error as Error).message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const onLoginSubmit = (data: LoginFormValues) => handleAction(() => login(data.email, data.password), "Login Berhasil", "Selamat datang kembali!", "Login Gagal");
    const onRegisterSubmit = (data: RegisterFormValues) => handleAction(() => register(data), "Registrasi Berhasil", "Akun Anda telah dibuat.", "Registrasi Gagal").then(() => setRegisterOpen(false));
    const onGoogleLogin = () => handleAction(loginWithGoogle, "Login Berhasil", "Selamat datang kembali!", "Login Gagal");
    const onLogout = () => handleAction(logout, "Logout Berhasil", "Anda telah keluar dari akun.", "Logout Gagal");

    const handleUpgradeToPremium = async () => {
        if (!user) {
            toast({ title: "Login Diperlukan", description: "Anda harus login untuk melakukan upgrade.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            // 1. Get a Stripe instance
            const stripe = await stripePromise;
            if (!stripe) throw new Error("Gagal memuat Stripe.");

            // 2. Call your backend to create a checkout session
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: user.uid, 
                    userEmail: user.email, 
                    userName: user.name 
                }),
            });

            const { sessionId, message } = await response.json();

            if (!response.ok) {
                throw new Error(message || 'Gagal membuat sesi checkout.');
            }

            // 3. Redirect to Stripe Checkout
            const { error } = await stripe.redirectToCheckout({ sessionId });

            if (error) {
                console.error("Stripe redirection error:", error);
                throw new Error(error.message);
            }
        } catch (error) {
             toast({ title: "Upgrade Gagal", description: (error as Error).message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }


    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Akun & Autentikasi</CardTitle>
                    <CardDescription>
                    Kelola sesi login Anda di sini. Gunakan akun untuk menyimpan data Anda secara permanen di cloud.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isLoading ? (
                       <p>Memuat informasi pengguna...</p>
                    ) : user ? (
                        <div className="space-y-4">
                            <h3 className="font-semibold">Informasi Pengguna</h3>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person avatar"/>
                                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{user.name}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" onClick={onLogout} disabled={isSubmitting}>
                                    <LogOut className="mr-2 h-4 w-4" /> Logout
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="space-y-4">
                                <Button variant="outline" className="w-full" onClick={onGoogleLogin} disabled={isSubmitting}>
                                    <GoogleIcon className="mr-2" />
                                    {isSubmitting ? "Memproses..." : "Masuk dengan Google"}
                                </Button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">
                                        Atau lanjutkan dengan email
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Form {...loginForm}>
                                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4 mt-4">
                                    <FormField control={loginForm.control} name="email" render={({ field }) => (
                                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} type="email" placeholder="admin@example.com" /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={loginForm.control} name="password" render={({ field }) => (
                                        <FormItem><FormLabel>Kata Sandi</FormLabel><FormControl><Input type="password" {...field} placeholder="••••••••" /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <div className="flex items-center gap-2">
                                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Memproses..." : "Login"}</Button>
                                    
                                    <Dialog open={isRegisterOpen} onOpenChange={setRegisterOpen}>
                                        <DialogTrigger asChild>
                                            <Button type="button" variant="outline">
                                                <UserPlus className="mr-2 h-4 w-4"/> Buat Akun
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Buat Akun Baru</DialogTitle>
                                                <DialogDescription>
                                                    Daftarkan akun baru untuk menyimpan data Anda.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="max-h-[65vh] overflow-y-auto pr-4">
                                                <Form {...registerForm}>
                                                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                                                        <FormField control={registerForm.control} name="storeName" render={({ field }) => (<FormItem><FormLabel>Nama Toko</FormLabel><FormControl><Input {...field} placeholder="Kedai Kopi Senja" /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={registerForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nama Lengkap Anda</FormLabel><FormControl><Input {...field} placeholder="Alex" /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={registerForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} placeholder="anda@email.com" /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={registerForm.control} name="password" render={({ field }) => (<FormItem><FormLabel>Kata Sandi</FormLabel><FormControl><Input type="password" {...field} placeholder="••••••••" /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={registerForm.control} name="confirmPassword" render={({ field }) => (<FormItem><FormLabel>Konfirmasi Kata Sandi</FormLabel><FormControl><Input type="password" {...field} placeholder="••••••••" /></FormControl><FormMessage /></FormItem>)} />
                                                        <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? "Mendaftarkan..." : "Buat Akun"}</Button>
                                                    </form>
                                                </Form>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    )}
                </CardContent>
            </Card>

            {user && (
                <Card>
                    <CardHeader>
                        <CardTitle>Status Langganan</CardTitle>
                        <CardDescription>Kelola status langganan premium Anda untuk membuka semua fitur.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {user.subscriptionStatus === 'premium' ? (
                             <div className="flex items-center space-x-4 rounded-md border p-4 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30">
                                <div className="flex-shrink-0">
                                    <Crown className="h-8 w-8 text-amber-500" />
                                </div>
                                <div className="flex-1 space-y-1">
                                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                                    Anda adalah Pengguna Premium
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Terima kasih telah mendukung kami! Anda memiliki akses ke semua fitur tanpa batas.
                                </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4">
                                <div>
                                    <h4 className="font-semibold">Akun Gratis</h4>
                                    <p className="text-sm text-muted-foreground">Akun gratis dibatasi hingga 10 resep produk.</p>
                                </div>
                                <Button onClick={handleUpgradeToPremium} disabled={isSubmitting} className="mt-2 sm:mt-0 bg-gradient-to-r from-primary to-blue-600 text-white">
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    {isSubmitting ? 'Memproses...' : 'Upgrade ke Premium'}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                     <CardFooter>
                        <Alert variant="default" className="w-full border-blue-200 dark:border-blue-800">
                            <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400"/>
                            <AlertTitle className="text-blue-700 dark:text-blue-300">Informasi Penting</AlertTitle>
                            <AlertDescription>
                                Proses upgrade akan mengarahkan Anda ke halaman pembayaran aman yang disediakan oleh Stripe. Pastikan Anda mengikuti semua langkah hingga selesai.
                            </AlertDescription>
                        </Alert>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
