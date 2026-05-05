/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  ChevronRight, 
  PlayCircle, 
  Layout, 
  Menu, 
  X, 
  ArrowLeft,
  GraduationCap,
  Settings,
  Search,
  ExternalLink,
  ClipboardList,
  CheckCircle,
  Moon,
  Sun,
  User,
  MessageSquare,
  Bot,
  Sparkles,
  Send,
  Circle,
  Trophy,
  Users
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchCourseData, Subject, Lesson, MOCK_DATA } from './services/courseService';

// --- Components ---

const AITutor = ({ lessonContext }: { lessonContext: string }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Olá! Eu sou seu tutor de IA. Como posso te ajudar com esta aula hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Você é um tutor educacional prestativo. O aluno está estudando a seguinte aula: "${lessonContext}". Responda à pergunta do aluno de forma clara e didática em Português do Brasil.\n\nPergunta: ${userMsg}`,
      });
      
      setMessages(prev => [...prev, { role: 'ai', text: response.text || 'Desculpe, não consegui processar sua pergunta.' }]);
    } catch (error) {
      console.error('AI Tutor Error:', error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Ocorreu um erro ao falar com o tutor. Verifique sua conexão.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Card className="border-indigo-100 shadow-sm overflow-hidden">
      <CardHeader className="bg-indigo-600 text-white py-3 px-4 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <CardTitle className="text-sm font-display">Tutor IA</CardTitle>
        </div>
        <Sparkles className="w-4 h-4 opacity-70" />
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-64 p-4">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tire sua dúvida..."
            className="flex-1 bg-zinc-50 dark:bg-zinc-900 border-none rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
          />
          <Button size="icon" onClick={handleSend} disabled={isTyping} className="h-9 w-9 bg-indigo-600">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const FeedbackTab = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
          <h3 className="font-bold text-green-800 dark:text-green-400">Obrigado pelo feedback!</h3>
          <p className="text-sm text-green-700 dark:text-green-500">Sua opinião nos ajuda a melhorar.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          O que achou desta aula?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button 
              key={star} 
              onClick={() => setRating(star)}
              className={`text-2xl transition-colors ${rating >= star ? 'text-yellow-400' : 'text-zinc-300'}`}
            >
              ★
            </button>
          ))}
        </div>
        <textarea 
          placeholder="Deixe seu comentário (opcional)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full min-h-[80px] p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Button 
          onClick={() => setSubmitted(true)} 
          disabled={rating === 0}
          className="w-full bg-indigo-600"
        >
          Enviar Feedback
        </Button>
      </CardContent>
    </Card>
  );
};

const Sidebar = ({ 
  subjects, 
  activeSubject, 
  activeLesson, 
  progress,
  darkMode,
  setDarkMode
}: { 
  subjects: Subject[], 
  activeSubject?: string, 
  activeLesson?: number,
  progress: Record<string, number[]>,
  darkMode: boolean,
  setDarkMode: (v: boolean) => void
}) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight dark:text-white">EducaFlow</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setDarkMode(!darkMode)}
          className="text-zinc-500"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>
      
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-6 py-4">
          <div>
            <h3 className="px-2 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Meus Cursos
            </h3>
            <div className="space-y-1">
              <Button 
                variant={activeSubject === undefined && activeLesson === undefined ? "secondary" : "ghost"} 
                className="w-full justify-start gap-2 font-medium dark:text-zinc-300 mb-2"
                render={<Link to="/" />}
                nativeButton={false}
              >
                <Layout className="w-4 h-4 text-indigo-600" />
                Início
              </Button>
              {subjects.map((subject) => {
                const completedCount = progress[subject.name]?.length || 0;
                const totalCount = subject.lessons.length;
                const percent = Math.round((completedCount / totalCount) * 100);
                
                return (
                  <div key={subject.name} className="space-y-1">
                    <Button 
                      variant={activeSubject === subject.name ? "secondary" : "ghost"} 
                      className="w-full justify-start gap-2 font-medium dark:text-zinc-300"
                      render={<Link to={`/subject/${encodeURIComponent(subject.name)}`} />}
                      nativeButton={false}
                    >
                      <BookOpen className="w-4 h-4" />
                      {subject.name}
                    </Button>
                    <div className="px-2 pb-2">
                      <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 transition-all duration-500" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-400 mt-1 block">{percent}% concluído</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {activeSubject && (
            <div>
              <h3 className="px-2 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Módulos
              </h3>
              <div className="space-y-1">
                {subjects.find(s => s.name === activeSubject)?.lessons.map((lesson) => {
                  const isCompleted = progress[activeSubject]?.includes(lesson.module_number);
                  return (
                    <Button 
                      key={lesson.module_number}
                      variant={activeLesson === lesson.module_number ? "secondary" : "ghost"} 
                      className="w-full justify-start gap-2 text-sm dark:text-zinc-400"
                      render={<Link to={`/subject/${encodeURIComponent(activeSubject)}/lesson/${lesson.module_number}`} />}
                      nativeButton={false}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        activeLesson === lesson.module_number 
                          ? 'bg-indigo-600 text-white' 
                          : isCompleted ? 'bg-green-100 text-green-600' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                      }`}>
                        {isCompleted ? <CheckCircle className="w-3 h-3" /> : lesson.module_number}
                      </div>
                      <span className="truncate">{lesson.title}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-zinc-500 dark:text-zinc-400"
          render={<Link to="/profile" />}
          nativeButton={false}
        >
          <User className="w-4 h-4" />
          Meu Perfil
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-zinc-500 dark:text-zinc-400"
          render={<Link to="/settings" />}
          nativeButton={false}
        >
          <Settings className="w-4 h-4" />
          Configurações
        </Button>
      </div>
    </div>
  );
};

const Header = ({ title, subjects }: { title: string, subjects: Subject[] }) => {
  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger
            nativeButton={true}
            render={
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="p-0 w-72">
            <Sidebar subjects={subjects} progress={{}} darkMode={false} setDarkMode={() => {}} />
          </SheetContent>
        </Sheet>
        <h2 className="font-display font-semibold text-lg dark:text-white">{title}</h2>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
          <input 
            type="search" 
            placeholder="Buscar aulas..." 
            className="pl-9 h-9 w-64 rounded-full bg-zinc-100 dark:bg-zinc-900 border-transparent focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-indigo-500 text-sm transition-all outline-none dark:text-zinc-200"
          />
        </div>
        <Button 
          size="icon" 
          variant="ghost" 
          className="rounded-full"
          render={<Link to="/profile" />}
          nativeButton={false}
        >
          <User className="w-5 h-5 text-zinc-500" />
        </Button>
      </div>
    </header>
  );
};

// --- Views ---

const UserProfile = ({ progress, subjects }: { progress: Record<string, number[]>, subjects: Subject[] }) => {
  const totalLessons = subjects.reduce((acc, s) => acc + s.lessons.length, 0);
  const completedLessons = Object.values(progress).reduce((acc, p) => acc + p.length, 0);
  const totalPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <Card className="w-full md:w-80 overflow-hidden">
          <div className="h-24 bg-indigo-600" />
          <CardContent className="pt-0 -mt-12 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border-4 border-white dark:border-zinc-950 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-4 overflow-hidden">
              <User className="w-12 h-12 text-zinc-400" />
            </div>
            <h2 className="text-xl font-bold dark:text-white">Estudante EducaFlow</h2>
            <p className="text-zinc-500 text-sm mb-6">Membro desde Abril 2026</p>
            
            <div className="w-full space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Progresso Geral</span>
                <span className="font-bold text-indigo-600">{totalPercent}%</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600" style={{ width: `${totalPercent}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1 space-y-6 w-full">
          <h2 className="text-2xl font-display font-bold dark:text-white">Minhas Conquistas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Trophy className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 dark:text-amber-400">Primeiros Passos</h4>
                  <p className="text-xs text-amber-700 dark:text-amber-500">Concluiu sua primeira aula.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="opacity-50 grayscale">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <BookOpen className="w-6 h-6 text-zinc-400" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-600">Mestre da Matemática</h4>
                  <p className="text-xs text-zinc-500">Conclua todas as aulas de Matemática.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-display font-bold pt-4 dark:text-white">Cursos em Andamento</h2>
          <div className="space-y-3">
            {subjects.map(subject => {
              const completed = progress[subject.name]?.length || 0;
              const total = subject.lessons.length;
              return (
                <Card key={subject.name}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      <span className="font-medium dark:text-zinc-200">{subject.name}</span>
                    </div>
                    <span className="text-sm text-zinc-500">{completed}/{total} aulas</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ForumPost {
  id: string;
  user: string;
  avatar?: string;
  content: string;
  timestamp: string;
}

const Forum = ({ subjectName, messages, onPost }: { subjectName: string, messages: ForumPost[], onPost: (content: string) => void }) => {
  const [newMsg, setNewMsg] = useState('');

  const handlePost = () => {
    if (!newMsg.trim()) return;
    onPost(newMsg);
    setNewMsg('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
        <h3 className="font-semibold mb-4 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          Fórum de Discussão - {subjectName}
        </h3>
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-2">
            <textarea 
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Compartilhe suas dúvidas ou insights com outros alunos..."
              className="w-full min-h-[100px] p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all"
            />
            <div className="flex justify-end">
              <Button onClick={handlePost} disabled={!newMsg.trim()} className="bg-indigo-600 hover:bg-indigo-700">
                Publicar Mensagem
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
            <Users className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500">Nenhuma discussão iniciada ainda. Seja o primeiro a perguntar!</p>
          </div>
        ) : (
          messages.slice().reverse().map((post) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm dark:text-white">{post.user}</span>
                    <span className="text-[10px] text-zinc-400">{new Date(post.timestamp).toLocaleString('pt-BR')}</span>
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {post.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

const SettingsView = () => {
  const [userData, setUserData] = useState({
    name: 'Estudante EducaFlow',
    email: 'estudante@educaflow.com.br',
    phone: '(11) 98765-4321',
    address: 'Rua das Flores, 123, São Paulo - SP'
  });

  const [docs, setDocs] = useState([
    { id: '1', name: 'Histórico Escolar.pdf', status: 'Aprovado', date: '2026-03-15' },
    { id: '2', name: 'RG_Frente.jpg', status: 'Em Análise', date: '2026-05-01' }
  ]);

  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Dados salvos com sucesso!');
    }, 1000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black dark:text-white">Configurações e Documentos</h1>
        <p className="text-zinc-500">Gerencie sua conta e interaja com a coordenação.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Dados Cadastrais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Nome Completo</label>
                  <input 
                    type="text" 
                    value={userData.name}
                    onChange={(e) => setUserData({...userData, name: e.target.value})}
                    className="w-full p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">E-mail</label>
                  <input 
                    type="email" 
                    value={userData.email}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                    className="w-full p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Telefone</label>
                  <input 
                    type="text" 
                    value={userData.phone}
                    onChange={(e) => setUserData({...userData, phone: e.target.value})}
                    className="w-full p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Endereço Completo</label>
                <input 
                  type="text" 
                  value={userData.address}
                  onChange={(e) => setUserData({...userData, address: e.target.value})}
                  className="w-full p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 font-bold px-8">
                  {saving ? 'Salvando...' : 'Atualizar Dados'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-600" />
                Validar Documentos com a Coordenação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center bg-zinc-50 dark:bg-zinc-900/50">
                <ExternalLink className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
                <h4 className="font-bold dark:text-white mb-1">Upload de Arquivos</h4>
                <p className="text-sm text-zinc-500 mb-6">Arraste seus documentos aqui ou clique no botão abaixo para selecionar.</p>
                <Button variant="outline" className="dark:border-zinc-700">Explorar Arquivos</Button>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-sm text-zinc-500 uppercase tracking-wider">Envios Recentes</h4>
                {docs.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <ClipboardList className="w-5 h-5 text-zinc-500" />
                      </div>
                      <div>
                        <div className="font-bold text-sm dark:text-white">{doc.name}</div>
                        <div className="text-[10px] text-zinc-400">Enviado em {doc.date}</div>
                      </div>
                    </div>
                    <div className={`text-xs font-bold px-3 py-1 rounded-full ${
                      doc.status === 'Aprovado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {doc.status}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-indigo-600 text-white border-none shadow-indigo-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Solicitações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="secondary" className="w-full justify-start text-indigo-700 font-bold">
                Declaração de Matrícula
              </Button>
              <Button variant="secondary" className="w-full justify-start text-indigo-700 font-bold">
                Histórico Acadêmico
              </Button>
              <Button variant="secondary" className="w-full justify-start text-indigo-700 font-bold">
                Certificado de Conclusão
              </Button>
            </CardContent>
          </Card>

          <Card className="dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <Bot className="w-4 h-4" /> Suporte Acadêmico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                Dúvidas sobre documentação ou prazos? Nosso orientador virtual pode ajudar.
              </p>
              <Button variant="outline" className="w-full border-indigo-200 text-indigo-600 dark:border-zinc-800 font-bold">Falar com Suporte</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Home = ({ subjects, progress }: { subjects: Subject[], progress: Record<string, number[]> }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-bold mb-3 dark:text-white bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Seu Futuro Começa Aqui
          </h1>
          <p className="text-zinc-500 text-xl max-w-2xl leading-relaxed">
            Bem-vindo ao EducaFlow. Explore nossas trilhas de conhecimento e comece a aprender hoje mesmo.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
            <Trophy className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Cursos Iniciados</div>
            <div className="text-2xl font-black dark:text-white">{Object.keys(progress).length}</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {subjects.map((subject, idx) => {
          const completed = progress[subject.name]?.length || 0;
          const total = subject.lessons.length;
          const percent = Math.round((completed / total) * 100);

          return (
            <motion.div
              key={subject.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link to={`/subject/${encodeURIComponent(subject.name)}`}>
                <Card className="hover:shadow-xl transition-all border-zinc-200 dark:border-zinc-800 group cursor-pointer h-full dark:bg-zinc-900 flex flex-col overflow-hidden border-b-4 border-b-indigo-600">
                  <CardHeader className="pb-4">
                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-2xl dark:text-white font-bold">{subject.name}</CardTitle>
                    <CardDescription className="dark:text-zinc-400 text-base">{total} Módulos disponíveis</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500 font-medium italic">Progresso</span>
                        <span className="font-bold text-indigo-600">{percent}%</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          className="h-full bg-indigo-600" 
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-indigo-600 font-bold group/link">
                      <span>Começar Trilhas</span>
                      <ChevronRight className="w-5 h-5 transform group-hover/link:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const SubjectDetail = ({ 
  subjects, 
  progress, 
  forumMessages, 
  postToForum 
}: { 
  subjects: Subject[], 
  progress: Record<string, number[]>,
  forumMessages: Record<string, ForumPost[]>,
  postToForum: (subj: string, content: string) => void
}) => {
  const { subjectName } = useParams<{ subjectName: string }>();
  const [activeTab, setActiveTab] = useState<'modules' | 'forum'>('modules');
  const subject = subjects.find(s => s.name === decodeURIComponent(subjectName || ''));
  
  if (!subject) return <div className="p-8 dark:text-white">Matéria não encontrada.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link to="/" className="inline-flex items-center text-zinc-500 hover:text-indigo-600 mb-8 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Início
      </Link>
      
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h1 className="text-5xl font-black mb-3 dark:text-white">{subject.name}</h1>
            <p className="text-zinc-500 text-xl">Explore os módulos e participe das discussões.</p>
          </div>
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shadow-inner">
            <button 
              onClick={() => setActiveTab('modules')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'modules' ? 'bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              Conteúdo
            </button>
            <button 
              onClick={() => setActiveTab('forum')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'forum' ? 'bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              Fórum
            </button>
          </div>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {activeTab === 'modules' ? (
          <motion.div
            key="modules"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {subject.lessons.map((lesson, idx) => {
              const isCompleted = progress[subject.name]?.includes(lesson.module_number);
              return (
                <motion.div
                  key={lesson.module_number}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link to={`/subject/${encodeURIComponent(subject.name)}/lesson/${lesson.module_number}`}>
                    <Card className={`hover:border-indigo-400 hover:shadow-md transition-all border-zinc-200 dark:border-zinc-800 group cursor-pointer dark:bg-zinc-900 ${isCompleted ? 'bg-green-50/20 dark:bg-green-900/5 border-green-200/50 shadow-inner' : ''}`}>
                      <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all text-lg ${
                            isCompleted 
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30' 
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:bg-indigo-600 group-hover:text-white'
                          }`}>
                            {isCompleted ? <CheckCircle className="w-6 h-6" /> : lesson.module_number}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">{lesson.title}</h3>
                            <p className="text-sm text-zinc-500">Módulo {lesson.module_number}</p>
                          </div>
                        </div>
                        <PlayCircle className={`w-8 h-8 transition-all ${isCompleted ? 'text-green-500' : 'text-zinc-300 group-hover:text-indigo-600 group-hover:scale-110'}`} />
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="forum"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Forum 
              subjectName={subject.name} 
              messages={forumMessages[subject.name] || []} 
              onPost={(content) => postToForum(subject.name, content)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LessonDetail = ({ 
  subjects, 
  progress, 
  toggleComplete 
}: { 
  subjects: Subject[], 
  progress: Record<string, number[]>,
  toggleComplete: (subj: string, mod: number) => void
}) => {
  const { subjectName, lessonNumber } = useParams<{ subjectName: string, lessonNumber: string }>();
  const subject = subjects.find(s => s.name === decodeURIComponent(subjectName || ''));
  const lesson = subject?.lessons.find(l => l.module_number === parseInt(lessonNumber || '1'));
  
  if (!subject || !lesson) return <div className="p-8 dark:text-white">Aula não encontrada.</div>;

  const isCompleted = progress[subject.name]?.includes(lesson.module_number);

  // Function to extract YouTube ID
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeId(lesson.video_url);

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
      <div className="flex-1 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <Link to={`/subject/${encodeURIComponent(subject.name)}`} className="inline-flex items-center text-zinc-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Ver todos os módulos
          </Link>
          <div className="text-sm font-medium text-zinc-400">
            {subject.name} • Módulo {lesson.module_number} de {subject.lessons.length}
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-4xl dark:text-white">{lesson.title}</h1>
            <Button 
              onClick={() => toggleComplete(subject.name, lesson.module_number)}
              variant={isCompleted ? "secondary" : "outline"}
              className={`gap-2 ${isCompleted ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' : ''}`}
            >
              {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              {isCompleted ? 'Concluído' : 'Marcar Concluído'}
            </Button>
          </div>
          
          <div className="prose prose-zinc dark:prose-invert max-w-none mb-12 text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {lesson.content.split('\n').map((para, i) => (
              <p key={i} className="mb-4">{para}</p>
            ))}
          </div>
          
          <Separator className="my-12 dark:bg-zinc-800" />
          
          {lesson.activity && (
            <div className="mb-12 space-y-6">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl dark:text-white">Atividade do Módulo</h2>
              </div>
              <Card className="bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/20">
                <CardContent className="p-6">
                  <p className="text-lg text-zinc-800 dark:text-zinc-200 mb-6">{lesson.activity}</p>
                  <div className="flex gap-3">
                    <Button 
                      className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                      onClick={() => !isCompleted && toggleComplete(subject.name, lesson.module_number)}
                    >
                      <CheckCircle className="w-4 h-4" />
                      {isCompleted ? 'Atividade Concluída' : 'Marcar como Concluída'}
                    </Button>
                    <Button variant="outline" className="dark:border-zinc-700 dark:text-zinc-300">Enviar Resposta</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <PlayCircle className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl dark:text-white">Vídeo da Aula</h2>
            </div>
            
            {videoId ? (
              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={lesson.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="aspect-video w-full rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                <PlayCircle className="w-12 h-12 mb-2 opacity-20" />
                <p>Vídeo não disponível para esta aula.</p>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800">
              <Button 
                variant="outline" 
                disabled={lesson.module_number === 1} 
                className="dark:border-zinc-700 dark:text-zinc-300"
                nativeButton={lesson.module_number === 1}
                render={lesson.module_number !== 1 ? (
                  <Link to={`/subject/${encodeURIComponent(subject.name)}/lesson/${lesson.module_number - 1}`}>
                    Módulo Anterior
                  </Link>
                ) : undefined}
              >
                {lesson.module_number === 1 && <span>Módulo Anterior</span>}
              </Button>
              
              <Button 
                className="bg-indigo-600 hover:bg-indigo-700" 
                disabled={lesson.module_number === subject.lessons.length}
                nativeButton={false}
                render={
                  <Link to={lesson.module_number !== subject.lessons.length ? `/subject/${encodeURIComponent(subject.name)}/lesson/${lesson.module_number + 1}` : "/profile"}>
                    {lesson.module_number !== subject.lessons.length ? "Próximo Módulo" : "Concluir Curso"}
                  </Link>
                }
              />
            </div>
          </div>
        </motion.div>
      </div>

      <aside className="w-full lg:w-80 space-y-6">
        <AITutor lessonContext={`${subject.name} - ${lesson.title}: ${lesson.content}`} />
        <FeedbackTab />
      </aside>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Record<string, number[]>>(() => {
    const saved = localStorage.getItem('educaflow_progress');
    return saved ? JSON.parse(saved) : {};
  });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('educaflow_dark');
    return saved === 'true';
  });
  const [forumMessages, setForumMessages] = useState<Record<string, ForumPost[]>>(() => {
    const saved = localStorage.getItem('educaflow_forum');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchCourseData();
      if (data.length > 0) {
        setSubjects(data);
      } else {
        setSubjects(MOCK_DATA);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem('educaflow_progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('educaflow_forum', JSON.stringify(forumMessages));
  }, [forumMessages]);

  useEffect(() => {
    localStorage.setItem('educaflow_dark', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleComplete = (subjectName: string, moduleNumber: number) => {
    setProgress(prev => {
      const current = prev[subjectName] || [];
      const isCompleted = current.includes(moduleNumber);
      
      if (isCompleted) {
        return { ...prev, [subjectName]: current.filter(m => m !== moduleNumber) };
      } else {
        return { ...prev, [subjectName]: [...current, moduleNumber] };
      }
    });
  };

  const postToForum = (subjectName: string, content: string) => {
    const newPost: ForumPost = {
      id: Math.random().toString(36).substr(2, 9),
      user: 'Você (Aluno)',
      content: content,
      timestamp: new Date().toISOString()
    };

    setForumMessages(prev => ({
      ...prev,
      [subjectName]: [...(prev[subjectName] || []), newPost]
    }));
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="space-y-4 w-full max-w-xs">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4 rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden transition-colors duration-300">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-72 flex-shrink-0">
          <SidebarWrapper 
            subjects={subjects} 
            progress={progress} 
            darkMode={darkMode} 
            setDarkMode={setDarkMode} 
          />
        </aside>
        
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <HeaderWrapper subjects={subjects} />
          <div className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Home subjects={subjects} progress={progress} />} />
              <Route path="/subject/:subjectName" element={
                <SubjectDetail 
                  subjects={subjects} 
                  progress={progress} 
                  forumMessages={forumMessages} 
                  postToForum={postToForum} 
                />
              } />
              <Route path="/subject/:subjectName/lesson/:lessonNumber" element={<LessonDetail subjects={subjects} progress={progress} toggleComplete={toggleComplete} />} />
              <Route path="/profile" element={<UserProfile progress={progress} subjects={subjects} />} />
              <Route path="/settings" element={<SettingsView />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

// Wrappers to use hooks within the Router context
function SidebarWrapper({ 
  subjects, 
  progress, 
  darkMode, 
  setDarkMode 
}: { 
  subjects: Subject[], 
  progress: Record<string, number[]>,
  darkMode: boolean,
  setDarkMode: (v: boolean) => void
}) {
  const { subjectName, lessonNumber } = useParams<{ subjectName?: string, lessonNumber?: string }>();
  const decodedSubject = subjectName ? decodeURIComponent(subjectName) : undefined;
  const decodedLesson = lessonNumber ? parseInt(lessonNumber) : undefined;
  
  return (
    <Sidebar 
      subjects={subjects} 
      activeSubject={decodedSubject} 
      activeLesson={decodedLesson} 
      progress={progress}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    />
  );
}

function HeaderWrapper({ subjects }: { subjects: Subject[] }) {
  const location = useLocation();
  let title = "Dashboard";
  
  if (location.pathname === "/") title = "Início";
  else if (location.pathname === "/profile") title = "Meu Perfil";
  else if (location.pathname.includes("/subject/")) {
    const parts = location.pathname.split("/");
    title = decodeURIComponent(parts[2]);
  }
  
  return <Header title={title} subjects={subjects} />;
}
