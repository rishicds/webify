
"use client";

import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CameraOff, UserCheck, UserX, Search } from 'lucide-react';
import type { Registration } from '@/lib/types';
import { checkInUser, getRegistrationById } from '@/lib/events';
import jsQR from 'jsqr';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

export function QRCheckIn({ eventId, attendees, onCheckInSuccess }: { eventId: string; attendees: Registration[], onCheckInSuccess: () => void }) {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [manualId, setManualId] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInResult, setCheckInResult] = useState<{status: 'success' | 'error', message: string, registration?: Registration} | null>(null);

  useEffect(() => {
    if (!isScanning) {
      // Stop camera stream when not scanning
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      return;
    }

    let animationFrameId: number;

    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          animationFrameId = requestAnimationFrame(tick);
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setIsScanning(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    };
    
    getCameraPermission();

    return () => {
        cancelAnimationFrame(animationFrameId);
        if (videoRef.current && videoRef.current.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }
    }
  }, [isScanning, toast]);

  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        if (code) {
          handleCheckIn(code.data);
          setIsScanning(false);
        }
      }
    }
    if (isScanning) {
        requestAnimationFrame(tick);
    }
  };
  
  const handleCheckIn = async (registrationId: string) => {
    setIsCheckingIn(true);
    setCheckInResult(null);

    try {
        const registration = await getRegistrationById(registrationId);

        if (!registration || registration.eventId !== eventId) {
            setCheckInResult({status: 'error', message: 'Invalid ticket for this event.'});
            return;
        }

        if (registration.checkedIn) {
            setCheckInResult({status: 'error', message: 'This ticket has already been used.', registration });
            return;
        }

        await checkInUser(registrationId);
        onCheckInSuccess(); // Refresh the parent component's data
        const updatedRegistration = await getRegistrationById(registrationId);
        setCheckInResult({ status: 'success', message: 'Check-in successful!', registration: updatedRegistration ?? undefined });
        toast({ title: "Check-in Successful", description: `${registration.userName} has been checked in.`});

    } catch (error) {
        console.error(error);
        setCheckInResult({status: 'error', message: 'An error occurred during check-in.'});
    } finally {
        setIsCheckingIn(false);
        setManualId('');
    }
  }


  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle>QR Code Scanner</CardTitle>
          <CardDescription>Scan attendee tickets to check them in.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isScanning ? (
            <Button onClick={() => setIsScanning(true)} className="w-full">Start Scanning</Button>
          ) : (
            <Button onClick={() => setIsScanning(false)} variant="outline" className="w-full">Stop Scanning</Button>
          )}

          {isScanning && (
            <div className="relative aspect-video bg-secondary rounded-md overflow-hidden flex items-center justify-center">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
              <canvas ref={canvasRef} className="hidden" />
              {hasCameraPermission === false && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4">
                  <CameraOff className="h-12 w-12 mb-2"/>
                  <p className="font-semibold">Camera Access Denied</p>
                  <p className="text-sm text-center">Please enable camera permissions in your browser settings.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <Card>
            <CardHeader>
                <CardTitle>Manual Check-in</CardTitle>
                <CardDescription>Enter a ticket ID to check in an attendee manually.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2">
                    <Input 
                        placeholder="Enter ticket ID"
                        value={manualId}
                        onChange={(e) => setManualId(e.target.value)}
                        disabled={isCheckingIn}
                    />
                    <Button onClick={() => handleCheckIn(manualId)} disabled={!manualId || isCheckingIn}>
                        {isCheckingIn ? <Loader2 className="animate-spin" /> : <Search />}
                    </Button>
                </div>
            </CardContent>
        </Card>
         
        {isCheckingIn && !checkInResult && (
            <Card className="flex items-center justify-center p-8">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 <p className="ml-4 text-muted-foreground">Verifying ticket...</p>
            </Card>
        )}

        {checkInResult && (
             <Alert variant={checkInResult.status === 'error' ? 'destructive' : 'default'} className={checkInResult.status === 'success' ? 'bg-green-500/10 border-green-500/50' : ''}>
                {checkInResult.status === 'success' ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                <AlertTitle>{checkInResult.status === 'success' ? 'Success' : 'Error'}</AlertTitle>
                <AlertDescription>
                    {checkInResult.message}
                </AlertDescription>
                {checkInResult.registration && (
                    <>
                    <Separator className="my-2" />
                     <div className="flex items-center gap-4 mt-2">
                        <Avatar>
                            <AvatarFallback>{checkInResult.registration.userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{checkInResult.registration.userName}</p>
                            <p className="text-sm">{checkInResult.registration.userEmail}</p>
                            {checkInResult.registration.checkedIn && <Badge className="mt-1" variant="secondary">Already Checked In</Badge>}
                        </div>
                     </div>
                    </>
                )}
            </Alert>
        )}

      </div>
    </div>
  );
}
