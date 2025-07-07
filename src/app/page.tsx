import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Package, ShoppingCart, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary">
            Login
          </Link>
          <Button asChild>
            <Link href="/login">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 md:py-32">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 font-headline">
            Transform Your Cafe Management
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
            Petrichor is the all-in-one POS, inventory, and analytics platform designed specifically for modern cafes and F&amp;B businesses. Stop juggling spreadsheets and start growing your business.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/login">
                Get Started For Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </section>

        <section id="features" className="bg-muted py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Everything You Need, All in One Place</h2>
              <p className="max-w-xl mx-auto text-muted-foreground mt-4">
                From the front counter to the back office, we've got you covered.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <ShoppingCart className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Effortless POS & Ordering</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    An intuitive cashier interface and a beautiful customer-facing order page to streamline your sales process.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Smart Inventory & Recipes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Manage raw materials, define recipes, and automatically calculate costs to stay on top of your profit margins.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <BarChart className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Insightful Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    A powerful dashboard that gives you a clear view of your revenue, costs, and best-selling products.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Petrichor. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
