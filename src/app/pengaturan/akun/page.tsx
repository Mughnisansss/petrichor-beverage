
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, AlertTriangle, KeyRound, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/AppContext";

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


export default function AkunPengaturanPage() {
    const { user, login, logout, register, isLoading, loginWithGoogle } = useAppContext();
    const { toast } = useToast();
    const [isRegisterOpen, setRegisterOpen] = useState(false);

    const loginForm = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const registerForm = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { storeName: "", name: "", email: "", password: "", confirmPassword: "" },
    });

    const handleLogout = async () => {
        try {
            await logout();
            toast({ title: "Logout Berhasil", description: "Anda telah keluar dari akun." });
        } catch(error) {
            toast({ title: "Logout Gagal", description: (error as Error).message, variant: "destructive" });
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            toast({ title: "Login Berhasil", description: "Selamat datang kembali!" });
        } catch (error) {
            toast({ title: "Login Gagal", description: (error as Error).message, variant: "destructive" });
        }
    };

    async function onLoginSubmit(data: LoginFormValues) {
        try {
            await login(data.email, data.password);
            toast({ title: "Login Berhasil", description: "Selamat datang kembali!" });
            loginForm.reset();
        } catch (error) {
             toast({ title: "Login Gagal", description: (error as Error).message, variant: "destructive" });
        }
    }

    async function onRegisterSubmit(data: RegisterFormValues) {
        try {
            await register({ storeName: data.storeName, name: data.name, email: data.email, password: data.password });
            toast({ title: "Registrasi Berhasil", description: "Akun Anda telah dibuat dan Anda berhasil login." });
            setRegisterOpen(false);
            registerForm.reset();
        } catch (error) {
            toast({ title: "Registrasi Gagal", description: (error as Error).message, variant: "destructive" });
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Akun & Autentikasi</CardTitle>
                <CardDescription>
                Kelola sesi login Anda di sini. Login memungkinkan data Anda tersimpan secara persisten.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {user ? (
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
                            <Button variant="ghost" onClick={handleLogout} disabled={isLoading}>
                                <LogOut className="mr-2 h-4 w-4" /> Logout
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="space-y-4">
                             <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
                                <GoogleIcon className="mr-2" />
                                {isLoading ? "Memproses..." : "Masuk dengan Google"}
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
                                  <Button type="submit" disabled={isLoading}>{isLoading ? "Memproses..." : "Login"}</Button>
                                  
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
                                                    <FormField control={registerForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input {...field} placeholder="John Doe" /></FormControl><FormMessage /></FormItem>)} />
                                                    <FormField control={registerForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} placeholder="anda@email.com" /></FormControl><FormMessage /></FormItem>)} />
                                                    <FormField control={registerForm.control} name="password" render={({ field }) => (<FormItem><FormLabel>Kata Sandi</FormLabel><FormControl><Input type="password" {...field} placeholder="••••••••" /></FormControl><FormMessage /></FormItem>)} />
                                                    <FormField control={registerForm.control} name="confirmPassword" render={({ field }) => (<FormItem><FormLabel>Konfirmasi Kata Sandi</FormLabel><FormControl><Input type="password" {...field} placeholder="••••••••" /></FormControl><FormMessage /></FormItem>)} />
                                                    <Button type="submit" disabled={isLoading} className="w-full">{isLoading ? "Mendaftarkan..." : "Buat Akun"}</Button>
                                                </form>
                                            </Form>
                                        </div>
                                    </DialogContent>
                                   </Dialog>
                                </div>
                            </form>
                        </Form>
                         <Alert className="mt-6">
                            <KeyRound className="h-4 w-4" />
                            <AlertTitle>Kredensial Demo</AlertTitle>
                            <AlertDescription>
                                Gunakan kredensial berikut untuk mencoba fitur login:
                                <ul className="list-disc pl-5 mt-2">
                                    <li><strong>Email:</strong> admin@example.com</li>
                                    <li><strong>Password:</strong> password</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
            </CardContent>
             <CardFooter>
                <Alert variant="destructive" className="w-full">
                    <AlertTriangle className="h-4 w-4"/>
                    <AlertTitle>Peringatan: Sistem Akun Simulasi</AlertTitle>
                    <AlertDescription>
                        Sistem ini mensimulasikan **satu akun tunggal**. Mendaftarkan akun baru atau masuk dengan Google akan **menimpa** kredensial login yang ada. Ini dirancang untuk pengembangan dan **tidak aman untuk penggunaan produksi**. Jangan gunakan kata sandi asli.
                    </AlertDescription>
                </Alert>
             </CardFooter>
        </Card>
    );
}
