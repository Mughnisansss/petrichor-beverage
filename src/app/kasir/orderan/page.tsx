
"use client";

import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { ShoppingCart, CheckCircle, Clock } from "lucide-react";

export default function OrderanPage() {
  const { orderQueue, updateQueuedOrderStatus, processQueuedOrder, rawMaterials, isLoading } = useAppContext();
  const { toast } = useToast();

  const handleProcessOrder = async (orderId: string) => {
    try {
      await processQueuedOrder(orderId);
      toast({
        title: "Sukses",
        description: `Orderan berhasil diproses dan dicatat sebagai penjualan.`,
      });
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleStatusUpdate = async (orderId: string, status: 'pending' | 'ready') => {
    try {
       await updateQueuedOrderStatus(orderId, status);
       toast({
         title: "Status Diperbarui",
         description: `Status orderan telah diubah.`,
       });
    } catch(error){
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Daftar Orderan Masuk</CardTitle>
            <CardDescription>Proses orderan yang masuk dari halaman 'Order' pelanggan.</CardDescription>
        </CardHeader>
        <CardContent>
            {orderQueue.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <ShoppingCart className="w-16 h-16 mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold">Tidak Ada Orderan Masuk</h3>
                    <p className="text-muted-foreground">Antrian pesanan dari halaman 'Order' akan muncul di sini.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <Accordion type="multiple" className="w-full space-y-4">
                        {orderQueue.map((order) => {
                            const total = order.items.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);

                            return (
                                <AccordionItem value={order.id} key={order.id} className={cn(
                                "rounded-lg border",
                                order.status === 'ready' && "bg-accent border-primary"
                                )}>
                                    <AccordionTrigger className="p-4 hover:no-underline">
                                        <div className="flex justify-between w-full items-center">
                                            <div className="flex items-center gap-4">
                                                <span className={cn(
                                                "flex h-8 w-8 items-center justify-center rounded-full text-white font-bold",
                                                order.status === 'ready' ? 'bg-destructive' : 'bg-primary'
                                                )}>
                                                {order.queueNumber}
                                                </span>
                                                <div>
                                                <div className="font-bold text-lg">Antrian #{order.queueNumber}</div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" /> {formatDate(order.createdAt, "HH:mm")}
                                                </div>
                                                </div>
                                            </div>
                                            <div className="text-right pr-4">
                                                <p className="font-bold">{formatCurrency(total)}</p>
                                                <p className="text-sm text-muted-foreground">{order.items.length} item</p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="p-4 pt-0">
                                    <Separator className="mb-4" />
                                        <div className="space-y-2">
                                            {order.items.map(item => (
                                                <div key={item.cartId} className="flex justify-between">
                                                    <div>
                                                    <p className="font-medium">
                                                        {item.quantity}x {item.name} {item.selectedPackagingName && `(${item.selectedPackagingName})`}
                                                    </p>
                                                    {item.selectedToppings && item.selectedToppings.length > 0 && (
                                                        <ul className="text-xs text-muted-foreground list-disc pl-5 mt-1">
                                                        {item.selectedToppings.map(topping => {
                                                            const toppingInfo = rawMaterials.find(m => m.id === topping.rawMaterialId);
                                                            return <li key={topping.rawMaterialId}>{toppingInfo?.name || '...'}</li>;
                                                        })}
                                                        </ul>
                                                    )}
                                                    </div>
                                                    <p>{formatCurrency(item.sellingPrice * item.quantity)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    <Separator className="my-4" />
                                    <div className="flex justify-end gap-2">
                                        {order.status === 'pending' && (
                                            <Button variant="secondary" onClick={() => handleStatusUpdate(order.id, 'ready')}>
                                                <CheckCircle className="mr-2 h-4 w-4" /> Tandai Siap
                                            </Button>
                                        )}
                                        <Button onClick={() => handleProcessOrder(order.id)} disabled={isLoading}>
                                                Proses & Bayar
                                        </Button>
                                    </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </div>
            )}
        </CardContent>
    </Card>
  );
}
