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
  name: z.string().min(2, "Nama harus memiliki setidaknya 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Konfirmasi kata sandi tidak cocok",
  path: ["confirmPassword"], // path of error
});

type RegisterFormValues = z.infer<typeof registerSchema>;


export default function AkunPengaturanPage() {
    const { user, login, logout, register, isLoading } = useAppContext();
    const { toast } = useToast();
    const [isRegisterOpen, setRegisterOpen] = useState(false);

    const loginForm = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const registerForm = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    });

    const handleLogout = async () => {
        try {
            await logout();
            toast({ title: "Logout Berhasil", description: "Anda telah keluar dari akun." });
        } catch(error) {
            toast({ title: "Logout Gagal", description: (error as Error).message, variant: "destructive" });
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
            await register({ name: data.name, email: data.email, password: data.password });
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
                         <Form {...loginForm}>
                            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
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
                                        <Form {...registerForm}>
                                            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                                                <FormField control={registerForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input {...field} placeholder="John Doe" /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={registerForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} placeholder="anda@email.com" /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={registerForm.control} name="password" render={({ field }) => (<FormItem><FormLabel>Kata Sandi</FormLabel><FormControl><Input type="password" {...field} placeholder="••••••••" /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={registerForm.control} name="confirmPassword" render={({ field }) => (<FormItem><FormLabel>Konfirmasi Kata Sandi</FormLabel><FormControl><Input type="password" {...field} placeholder="••••••••" /></FormControl><FormMessage /></FormItem>)} />
                                                <Button type="submit" disabled={isLoading} className="w-full">{isLoading ? "Mendaftarkan..." : "Buat Akun"}</Button>
                                            </form>
                                        </Form>
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
                    <AlertTitle>Peringatan Keamanan</AlertTitle>
                    <AlertDescription>
                        Sistem login ini adalah **simulasi untuk pengembangan** dan tidak aman. Jangan gunakan kata sandi asli.
                    </AlertDescription>
                </Alert>
             </CardFooter>
        </Card>
    );
}
