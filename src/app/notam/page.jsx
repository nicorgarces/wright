"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Loader,
  Bell,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import Header from "../../components/Header";
import useHandleStreamResponse from "../../utils/useHandleStreamResponse";
import useLanguage from "../../utils/useLanguage";

const SYSTEM_MESSAGE = {
  role: "system",
  content: `You are a NOTAM AI Assistant for Colombian aviation. You have access to real-time NOTAM data for Colombian airports.`,
};

export default function NOTAMPage() {
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
      const response = await fetch("/api/notam-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [SYSTEM_MESSAGE, ...messages, userMessage],
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
          ? "Which airports have limitations?"
          : "¿Cuáles aeropuertos tienen limitaciones?",
      category: language === "en" ? "Status" : "Estado",
    },
    {
      question:
        language === "en"
          ? "Is SKBO operational?"
          : "¿Está SKBO operacional?",
      category: language === "en" ? "Airport Check" : "Verificación",
    },
    {
      question:
        language === "en"
          ? "Show me all airport restrictions"
          : "Muéstrame todas las restricciones de aeropuertos",
      category: language === "en" ? "Overview" : "Resumen",
    },
    {
      question:
        language === "en"
          ? "What's wrong with SKCG?"
          : "¿Qué pasa con SKCG?",
      category: language === "en" ? "Specific Issue" : "Problema Específico",
    },
    {
      question:
        language === "en"
          ? "Are there any closed airports?"
          : "¿Hay aeropuertos cerrados?",
      category: language === "en" ? "Closures" : "Cierres",
    },
    {
      question:
        language === "en"
          ? "What are the current NOTAMs?"
          : "¿Cuáles son los NOTAMs actuales?",
      category: language === "en" ? "Current Status" : "Estado Actual",
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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c4c284] to-[#dcc39c] flex items-center justify-center">
              <Bell size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
                NOTAM AI Assistant
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {language === "en"
                  ? "AI assistant for Colombian airport NOTAM status"
                  : "Asistente de IA para estado NOTAM de aeropuertos colombianos"}
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
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#c4c284] to-[#dcc39c] rounded-full flex items-center justify-center mb-6">
                <Bell size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-black dark:text-white mb-3">
                {language === "en"
                  ? "Welcome to NOTAM AI Assistant!"
                  : "¡Bienvenido al Asistente NOTAM AI!"}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                {language === "en"
                  ? "I can help you check the operational status of Colombian airports, including NOTAMs, restrictions, and closures."
                  : "Puedo ayudarte a verificar el estado operacional de aeropuertos colombianos, incluyendo NOTAMs, restricciones y cierres."}
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
                        className="text-[#c4c284] mt-0.5 flex-shrink-0"
                      />
                      <div>
                        <p className="text-sm font-medium text-black dark:text-white group-hover:text-[#c4c284] transition-colors duration-200">
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

              <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 max-w-2xl mx-auto">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={20}
                    className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
                  />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-900 dark:text-yellow-200 mb-1">
                      {language === "en" ? "Important" : "Importante"}
                    </p>
                    <p className="text-yellow-800 dark:text-yellow-300">
                      {language === "en"
                        ? "This assistant provides guidance based on NOTAM data. Always verify critical information with official sources."
                        : "Este asistente proporciona orientación basada en datos NOTAM. Siempre verifica información crítica con fuentes oficiales."}
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
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c4c284] to-[#dcc39c] flex items-center justify-center flex-shrink-0">
                      <Bell size={16} className="text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white"
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c4c284] to-[#dcc39c] flex items-center justify-center flex-shrink-0">
                    <Bell size={16} className="text-white" />
                  </div>
                  <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 text-black dark:text-white">
                    <div className="prose prose-sm max-w-none">
                      {streamingMessage.split("\n").map((line, i) => (
                        <p key={i} className={i === 0 ? "" : "mt-2"}>
                          {line}
                        </p>
                      ))}
                      <span className="inline-block w-2 h-4 bg-[#c4c284] opacity-75 animate-pulse"></span>
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
                placeholder={
                  language === "en"
                    ? "Ask about airport status..."
                    : "Pregunta sobre estado de aeropuertos..."
                }
                disabled={isLoading}
                className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c4c284] focus:border-transparent disabled:opacity-50"
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
              className="px-6 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] hover:from-[#1E40AF] hover:to-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <Send size={18} />
              <span className="hidden sm:inline">
                {language === "en" ? "Send" : "Enviar"}
              </span>
            </button>
          </form>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            {language === "en"
              ? "NOTAM AI can make mistakes. Verify important information with official sources."
              : "NOTAM AI puede cometer errores. Verifica información importante con fuentes oficiales."}
          </p>
        </div>
      </div>
    </div>
  );
}
