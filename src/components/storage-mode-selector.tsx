"use client";

import React from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, HardDrive, Server, AlertCircle } from "lucide-react";

export function StorageModeSelector() {
  const { storageMode, setStorageMode, isLoading } = useAppContext();

  const storageModes = [
    {
      id: 'local' as const,
      name: 'Local Storage',
      description: 'Browser-based storage, works offline, single device',
      icon: HardDrive,
      status: 'stable',
      features: ['No database needed', 'Works offline', 'Private to device', 'Fast performance'],
    },
    {
      id: 'server' as const,
      name: 'File Database',
      description: 'Server-based JSON file storage, for demo/testing',
      icon: Server,
      status: 'demo',
      features: ['Multiple users', 'Data persistence', 'Demo purposes only', 'Data lost on restart'],
    },
    {
      id: 'database' as const,
      name: 'PostgreSQL Database',
      description: 'Production-ready database with full features',
      icon: Database,
      status: 'production',
      features: ['Production ready', 'Scalable', 'Data persistence', 'Requires setup'],
    },
  ];

  const handleModeChange = (newMode: 'local' | 'server' | 'database') => {
    if (isLoading) return;
    setStorageMode(newMode);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Storage Mode</h2>
        <p className="text-muted-foreground">
          Choose how your application data is stored and managed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {storageModes.map((mode) => {
          const Icon = mode.icon;
          const isActive = storageMode === mode.id;
          const isProduction = mode.status === 'production';
          const isDemo = mode.status === 'demo';

          return (
            <Card 
              key={mode.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                isActive ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleModeChange(mode.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{mode.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {isProduction && (
                          <Badge variant="default" className="text-xs">
                            Production
                          </Badge>
                        )}
                        {isDemo && (
                          <Badge variant="secondary" className="text-xs">
                            Demo Only
                          </Badge>
                        )}
                        {mode.status === 'stable' && (
                          <Badge variant="outline" className="text-xs">
                            Stable
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {isActive && (
                    <Badge variant="default" className="bg-primary">
                      Active
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {mode.description}
                </p>
                <ul className="space-y-2">
                  {mode.features.map((feature, index) => (
                    <li key={index} className="text-xs flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {isProduction && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div className="text-xs text-yellow-800">
                        <strong>Requires setup:</strong> Configure DATABASE_URL in .env file and run Prisma migrations.
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Current Mode: {storageMode}</CardTitle>
          <CardDescription>
            {storageMode === 'local' && 'Your data is stored in browser localStorage. It persists on this device only.'}
            {storageMode === 'server' && 'Your data is stored in a server-side JSON file. Data may be lost on server restart.'}
            {storageMode === 'database' && 'Your data is stored in PostgreSQL database. Production-ready with full persistence.'}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}