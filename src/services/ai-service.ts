import { DevvAI } from '@devvai/devv-code-backend'

class AIService {
  private ai: DevvAI

  constructor() {
    this.ai = new DevvAI()
  }

  // Analyze device data using Kimi model
  async analyzeDeviceData(deviceData: any): Promise<string> {
    try {
      const response = await this.ai.chat.completions.create({
        model: 'kimi-k2-0711-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert medical device analyst. Analyze the provided device data and provide insights on:
            1. Device health status
            2. Maintenance recommendations
            3. Performance metrics
            4. Risk assessment
            5. Compliance status
            
            Provide clear, actionable recommendations for healthcare professionals.`
          },
          {
            role: 'user',
            content: `Please analyze this medical device data: ${JSON.stringify(deviceData, null, 2)}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })

      return response.choices[0]?.message?.content || 'No analysis available'
    } catch (error) {
      console.error('AI Analysis Error:', error)
      throw new Error('Failed to analyze device data')
    }
  }

  // Generate maintenance recommendations
  async generateMaintenanceRecommendations(devices: any[]): Promise<string> {
    try {
      const response = await this.ai.chat.completions.create({
        model: 'kimi-k2-0711-preview',
        messages: [
          {
            role: 'system',
            content: `You are a medical device maintenance expert. Based on the device fleet data, provide:
            1. Priority maintenance recommendations
            2. Preventive care schedules
            3. Risk mitigation strategies
            4. Resource allocation suggestions
            
            Focus on patient safety and operational efficiency.`
          },
          {
            role: 'user',
            content: `Analyze this device fleet and provide maintenance recommendations: ${JSON.stringify(devices, null, 2)}`
          }
        ],
        max_tokens: 1200,
        temperature: 0.2
      })

      return response.choices[0]?.message?.content || 'No recommendations available'
    } catch (error) {
      console.error('Maintenance Analysis Error:', error)
      throw new Error('Failed to generate maintenance recommendations')
    }
  }

  // Chat with AI assistant for general queries
  async* chatStream(messages: Array<{role: 'user' | 'assistant' | 'system'; content: string}>): AsyncGenerator<string, void, unknown> {
    try {
      const stream = await this.ai.chat.completions.create({
        model: 'kimi-k2-0711-preview',
        messages: [
          {
            role: 'system',
            content: `You are OphthalmoTech AI Assistant, specialized in medical device management, ophthalmology equipment, and healthcare operations. 
            
            You help with:
            - Medical device troubleshooting
            - Maintenance scheduling
            - Compliance requirements
            - Safety protocols
            - Equipment specifications
            - Regulatory guidance
            
            Always prioritize patient safety and regulatory compliance in your responses.`
          },
          ...messages
        ],
        stream: true,
        max_tokens: 2000,
        temperature: 0.7
      })

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          yield content
        }
      }
    } catch (error) {
      console.error('Chat Stream Error:', error)
      throw new Error('Failed to start chat session')
    }
  }

  // Analyze uploaded files for device information
  async analyzeUploadedFile(fileContent: string, fileName: string): Promise<string> {
    try {
      const response = await this.ai.chat.completions.create({
        model: 'kimi-k2-0711-preview',
        messages: [
          {
            role: 'system',
            content: `You are a medical device data analyst. Analyze uploaded files and extract:
            1. Device specifications
            2. Serial numbers and model information
            3. Maintenance history
            4. Compliance certifications
            5. Performance data
            6. Safety alerts or recalls
            
            Structure the analysis in a clear, professional format suitable for medical device management.`
          },
          {
            role: 'user',
            content: `Analyze this uploaded file "${fileName}":\n\n${fileContent}`
          }
        ],
        max_tokens: 1500,
        temperature: 0.2
      })

      return response.choices[0]?.message?.content || 'No analysis available'
    } catch (error) {
      console.error('File Analysis Error:', error)
      throw new Error('Failed to analyze uploaded file')
    }
  }

  // Generate general response (backward compatibility)
  async generateResponse(prompt: string, isStreaming: boolean = false): Promise<string> {
    try {
      const response = await this.ai.chat.completions.create({
        model: 'kimi-k2-0711-preview',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })

      return response.choices[0]?.message?.content || 'No response available'
    } catch (error) {
      console.error('AI Response Error:', error)
      throw new Error('Failed to generate AI response')
    }
  }
}

export const aiService = new AIService()
