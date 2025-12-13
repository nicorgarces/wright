"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Loader,
  Plane,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import Header from "../../components/Header";
import useHandleStreamResponse from "../../utils/useHandleStreamResponse";
import useLanguage from "../../utils/useLanguage";
import { t } from "../../utils/translations";

const SYSTEM_MESSAGE = {
  role: "system",
  content: `You are RAC AI, a specialized assistant for Colombian aviation regulations (Reglamento Aeronáutico Colombiano - RAC). You have extensive knowledge of Colombian aviation laws, procedures, and regulations.

Your expertise includes:
- RAC regulations and compliance requirements
- Colombian aviation licensing and certifications
- Airport operations and procedures in Colombia
- Air traffic control procedures
- Aviation safety requirements
- Aircraft registration and maintenance requirements
- Flight operations and limitations
- Colombian aviation authority (Aerocivil) procedures

Guidelines:
- Always provide accurate, regulation-based answers
- Reference specific RAC sections when possible
- If uncertain, clearly state your limitations
- Suggest contacting Aerocivil for official confirmations when appropriate
- Be helpful but emphasize safety and regulatory compliance
- Respond in the user's language (Spanish or English)

Remember: You provide guidance based on RAC regulations, but official interpretations should always be confirmed with Colombian aviation authorities.`,
};

export default function RACAssistantPage() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const messagesEndRef = useRef(null);
  const { language } = useLanguage();

  const handleFinish = useCallback((message) => {
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: message, timestamp: Date.now() },
    ]);
    setStreamingMessage("");
    setIsLoading(false);
  }, []);

  const handleStreamResponse = useHandleStreamResponse({
    onChunk: setStreamingMessage,
    onFinish: handleFinish,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: inputMessage.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/integrations/chat-gpt/conversationgpt4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [SYSTEM_MESSAGE, ...messages, userMessage],
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      handleStreamResponse(response);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Lo siento, hay un error de conexión. Por favor, intenta nuevamente. / Sorry, there was a connection error. Please try again.",
          timestamp: Date.now(),
          isError: true,
        },
      ]);
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    {
      question:
        language === "en"
          ? "What are the requirements to obtain a private pilot license in Colombia?"
          : "¿Cuáles son los requisitos para obtener una licencia de piloto privado en Colombia?",
      category: language === "en" ? "Licensing" : "Licencias",
    },
    {
      question:
        language === "en"
          ? "What are the noise abatement procedures for Colombian airports?"
          : "¿Cuáles son los procedimientos de reducción de ruido para aeropuertos colombianos?",
      category: language === "en" ? "Operations" : "Operaciones",
    },
    {
      question:
        language === "en"
          ? "What documents do I need to register an aircraft in Colombia?"
          : "¿Qué documentos necesito para registrar una aeronave en Colombia?",
      category: language === "en" ? "Registration" : "Registro",
    },
    {
      question:
        language === "en"
          ? "What are the requirements for IFR flight in Colombian airspace?"
          : "¿Cuáles son los requisitos para vuelo IFR en espacio aéreo colombiano?",
      category:
        language === "en" ? "Flight Operations" : "Operaciones de Vuelo",
    },
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex flex-col">
      <Header />

      {/* Page Header */}
      <div className="bg-white dark:bg-[#1E1E1E] border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#B83AE0] to-[#DF9EFF] flex items-center justify-center">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
                RAC AI Assistant
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Asistente especializado en regulaciones aeronáuticas colombianas
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-[1180px] mx-auto w-full px-4 sm:px-6">
        {/* Messages Area */}
        <div className="flex-1 py-6">
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#B83AE0] to-[#DF9EFF] rounded-full flex items-center justify-center mb-6">
                <Bot size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-black dark:text-white mb-3">
                ¡Bienvenido al Asistente RAC AI!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Soy tu asistente especializado en el Reglamento Aeronáutico
                Colombiano. Puedo ayudarte con licencias, procedimientos,
                regulaciones y más.
              </p>

              {/* Quick Questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-8">
                {quickQuestions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(item.question)}
                    className="p-4 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-xl text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-3">
                      <Lightbulb
                        size={16}
                        className="text-[#B83AE0] mt-0.5 flex-shrink-0"
                      />
                      <div>
                        <p className="text-sm font-medium text-black dark:text-white group-hover:text-[#B83AE0] transition-colors duration-200">
                          {item.question}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {item.category}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 max-w-2xl mx-auto">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={20}
                    className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                  />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                      Importante / Important
                    </p>
                    <p className="text-blue-800 dark:text-blue-300">
                      Este asistente proporciona orientación basada en las
                      regulaciones RAC, pero las interpretaciones oficiales
                      siempre deben confirmarse con la Aerocivil de Colombia.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Messages List */
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B83AE0] to-[#DF9EFF] flex items-center justify-center flex-shrink-0">
                      <Bot size={16} className="text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      message.role === "user"
                        ? "bg-[#468BFF] text-white"
                        : message.isError
                          ? "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                          : "bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 text-black dark:text-white"
                    }`}
                  >
                    <div className="prose prose-sm max-w-none">
                      {message.content.split("\n").map((line, i) => (
                        <p
                          key={i}
                          className={`${i === 0 ? "" : "mt-2"} ${message.role === "user" ? "text-white" : ""}`}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>

                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                      <User
                        size={16}
                        className="text-gray-700 dark:text-gray-300"
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming Message */}
              {streamingMessage && (
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B83AE0] to-[#DF9EFF] flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 text-black dark:text-white">
                    <div className="prose prose-sm max-w-none">
                      {streamingMessage.split("\n").map((line, i) => (
                        <p key={i} className={i === 0 ? "" : "mt-2"}>
                          {line}
                        </p>
                      ))}
                      <span className="inline-block w-2 h-4 bg-[#B83AE0] opacity-75 animate-pulse"></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1E1E1E] sticky bottom-0 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Pregunta sobre regulaciones RAC... / Ask about RAC regulations..."
                disabled={isLoading}
                className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#B83AE0] focus:border-transparent disabled:opacity-50"
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader size={20} className="text-gray-400 animate-spin" />
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-[#B83AE0] hover:bg-[#9F2AB8] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <Send size={18} />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            RAC AI puede cometer errores. Verifica información importante con
            Aerocivil.
          </p>
        </div>
      </div>
    </div>
  );
}
