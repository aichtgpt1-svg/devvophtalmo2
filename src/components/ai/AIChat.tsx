import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { aiService } from '@/services/ai-service'
import { useToast } from '@/hooks/use-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm your OphthalmoTech AI Assistant. I'm here to help you with:

• Medical device troubleshooting
• Maintenance scheduling and procedures  
• Compliance requirements and regulations
• Equipment specifications and safety protocols
• Regulatory guidance and documentation

How can I assist you today?`,
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, currentStreamingMessage])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsStreaming(true)
    setCurrentStreamingMessage('')

    try {
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      let fullResponse = ''
      
      for await (const chunk of aiService.chatStream(conversationHistory)) {
        fullResponse += chunk
        setCurrentStreamingMessage(fullResponse)
      }

      // Add complete message to history
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      setCurrentStreamingMessage('')
    } catch (error) {
      console.error('Chat error:', error)
      toast({
        title: 'Chat Error',
        description: 'Failed to get response from AI assistant. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsStreaming(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hello! I'm your OphthalmoTech AI Assistant. How can I help you today?`,
        timestamp: new Date()
      }
    ])
  }

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              AI Assistant
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearChat}
              disabled={isStreaming}
            >
              Clear Chat
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className={
                      message.role === 'assistant' 
                        ? "bg-blue-100 text-blue-600" 
                        : "bg-gray-100 text-gray-600"
                    }>
                      {message.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {message.role === 'assistant' ? 'AI Assistant' : 'You'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className={`rounded-lg p-3 ${
                      message.role === 'assistant' 
                        ? 'bg-gray-50 border border-gray-200' 
                        : 'bg-blue-50 border border-blue-200'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Streaming Message */}
              {isStreaming && currentStreamingMessage && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">AI Assistant</span>
                      <span className="text-xs text-gray-500">typing...</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-sm whitespace-pre-wrap">
                        {currentStreamingMessage}
                        <span className="animate-pulse ml-1">▋</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Loading Indicator */}
              {isStreaming && !currentStreamingMessage && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">AI Assistant</span>
                      <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-sm text-gray-500">Thinking...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about device maintenance, troubleshooting, compliance..."
                disabled={isStreaming}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={!inputValue.trim() || isStreaming}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
