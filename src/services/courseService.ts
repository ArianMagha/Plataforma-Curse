import Papa from 'papaparse';

export interface Lesson {
  subject: string;
  module_number: number;
  title: string;
  content: string;
  video_url: string;
  activity?: string;
}

export interface Subject {
  name: string;
  lessons: Lesson[];
}

// Default Google Sheet URL (Example)
// The user can replace this with their own published CSV URL
const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT_Yv_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y/pub?output=csv';

export async function fetchCourseData(url: string = DEFAULT_SHEET_URL): Promise<Subject[]> {
  try {
    const response = await fetch(url);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const lessons = results.data as any[];
          const subjectsMap: Record<string, Lesson[]> = {};

          lessons.forEach((row) => {
            const subjectName = row.subject || 'Sem Assunto';
            if (!subjectsMap[subjectName]) {
              subjectsMap[subjectName] = [];
            }
            subjectsMap[subjectName].push({
              subject: subjectName,
              module_number: row.module_number || 1,
              title: row.title || 'Sem Título',
              content: row.content || '',
              video_url: row.video_url || '',
              activity: row.activity || '',
            });
          });

          const subjects: Subject[] = Object.entries(subjectsMap).map(([name, lessons]) => ({
            name,
            lessons: lessons.sort((a, b) => a.module_number - b.module_number),
          }));

          resolve(subjects);
        },
        error: (error: any) => {
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error('Erro ao buscar dados do Google Sheets:', error);
    return [];
  }
}

// Mock data for initial development if the sheet is not provided or fails
export const MOCK_DATA: Subject[] = [
  {
    name: 'Matemática',
    lessons: [
      { subject: 'Matemática', module_number: 1, title: 'Introdução à Álgebra', content: 'Nesta aula vamos aprender os conceitos básicos de álgebra...', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', activity: 'Resolva: Se x + 5 = 10, qual o valor de x?' },
      { subject: 'Matemática', module_number: 2, title: 'Equações do 1º Grau', content: 'Como resolver equações simples...', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', activity: 'Resolva: 2x - 4 = 12' },
      { subject: 'Matemática', module_number: 3, title: 'Geometria Básica', content: 'Triângulos, quadrados e círculos...', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', activity: 'Qual a área de um quadrado de lado 4cm?' },
      { subject: 'Matemática', module_number: 4, title: 'Funções', content: 'Entendendo o conceito de função...', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', activity: 'Dada a função f(x) = 2x + 1, calcule f(3).' },
      { subject: 'Matemática', module_number: 5, title: 'Probabilidade', content: 'Chances e estatística...', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', activity: 'Qual a chance de sair cara ao lançar uma moeda?' },
    ]
  },
  {
    name: 'História',
    lessons: [
      { subject: 'História', module_number: 1, title: 'Brasil Colônia', content: 'O início da colonização portuguesa...', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', activity: 'Quem descobriu o Brasil?' },
      { subject: 'História', module_number: 2, title: 'Independência do Brasil', content: 'O grito do Ipiranga...', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', activity: 'Em que ano ocorreu a independência?' },
      { subject: 'História', module_number: 3, title: 'Revolução Industrial', content: 'As máquinas mudando o mundo...', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', activity: 'Qual país foi o berço da Revolução Industrial?' },
      { subject: 'História', module_number: 4, title: 'Primeira Guerra Mundial', content: 'O conflito que mudou o século XX...', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', activity: 'Quais eram as duas principais alianças na guerra?' },
      { subject: 'História', module_number: 5, title: 'Era Vargas', content: 'O governo de Getúlio Vargas...', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', activity: 'Cite uma lei trabalhista criada por Vargas.' },
    ]
  }
];
