import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { useAuthStore } from '@/store/auth-store'
import { useToast } from '@/hooks/use-toast'
import { Eye, Mail, Shield, Lock } from 'lucide-react'

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address')
})

const otpSchema = z.object({
  code: z.string().min(6, 'OTP code must be 6 digits')
})

type EmailForm = z.infer<typeof emailSchema>
type OTPForm = z.infer<typeof otpSchema>

export default function LoginForm() {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otpValue, setOtpValue] = useState('')
  
  const { sendOTP, verifyOTP, isLoading } = useAuthStore()
  const { toast } = useToast()

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema)
  })

  const handleSendOTP = async (data: EmailForm) => {
    try {
      await sendOTP(data.email)
      setEmail(data.email)
      setStep('otp')
      toast({
        title: 'OTP Sent',
        description: `Verification code sent to ${data.email}`
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send OTP. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const handleVerifyOTP = async () => {
    if (otpValue.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter a 6-digit verification code',
        variant: 'destructive'
      })
      return
    }

    try {
      await verifyOTP(email, otpValue)
      toast({
        title: 'Welcome to OphthalmoTech',
        description: 'Successfully logged in'
      })
    } catch (error) {
      toast({
        title: 'Invalid Code',
        description: 'The verification code is incorrect. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const handleBackToEmail = () => {
    setStep('email')
    setOtpValue('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Eye className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            OphthalmoTech
          </CardTitle>
          <CardDescription className="text-gray-600">
            Medical Device Management Platform
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 'email' ? (
            <div key="email" className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Secure email verification required</span>
              </div>
              
              <form onSubmit={emailForm.handleSubmit(handleSendOTP)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="doctor@hospital.com"
                      className="pl-10"
                      {...emailForm.register('email')}
                    />
                  </div>
                  {emailForm.formState.errors.email && (
                    <p className="text-sm text-red-600">
                      {emailForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              </form>
            </div>
          ) : (
            <div key="otp" className="space-y-4">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Lock className="w-4 h-4" />
                  <span>Enter verification code sent to:</span>
                </div>
                <p className="font-medium text-gray-900">{email}</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-center block">
                    6-Digit Verification Code
                  </Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otpValue}
                      onChange={setOtpValue}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    onClick={handleVerifyOTP}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading || otpValue.length !== 6}
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    onClick={handleBackToEmail}
                    className="w-full"
                    disabled={isLoading}
                  >
                    Back to Email
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
