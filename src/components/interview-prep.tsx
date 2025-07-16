
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, Sparkles, CheckCircle } from "lucide-react";
import { generateInterviewQuestions, GenerateInterviewQuestionsOutput } from "@/ai/flows/generate-interview-questions";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import useLocalStorage from "@/hooks/use-local-storage";
import { Button } from "./ui/button";

export function InterviewPrep() {
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<GenerateInterviewQuestionsOutput["questions"]>([]);
  const [lastFetched, setLastFetched] = useLocalStorage<string | null>('interview-questions-date', null);
  const [cachedQuestions, setCachedQuestions] = useLocalStorage<GenerateInterviewQuestionsOutput["questions"]>('interview-questions-cache', []);
  const [learnedQuestions, setLearnedQuestions] = useLocalStorage<string[]>('interview-questions-learned', []);
  
  const { toast } = useToast();

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const result = await generateInterviewQuestions();
      setQuestions(result.questions);
      const today = new Date().toISOString().split('T')[0];
      setLastFetched(today);
      setCachedQuestions(result.questions);
    } catch (error) {
      console.error("Error generating interview questions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch new interview questions. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMarkAsLearned = (question: string) => {
    setLearnedQuestions(prev => {
      const isLearned = prev.includes(question);
      if (isLearned) {
        return prev.filter(q => q !== question);
      } else {
        return [...prev, question];
      }
    });
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (lastFetched === today && cachedQuestions.length > 0) {
      setQuestions(cachedQuestions);
    } else {
      fetchQuestions();
      setLearnedQuestions([]); // Reset learned questions for the new day
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-primary" />
          Daily Interview Questions
        </CardTitle>
        <CardDescription>
          Five new questions every day to sharpen your interview skills. Mark questions as 'learned' to track your progress.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-10 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">
              Generating your daily questions...
            </p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {questions.map((q, index) => {
              const isLearned = learnedQuestions.includes(q.question);
              return (
                <AccordionItem value={`item-${index}`} key={index} className="border rounded-lg px-4 bg-secondary/30">
                  <AccordionTrigger className="text-left font-medium hover:no-underline">
                    <div className="flex items-center gap-3">
                       {isLearned && <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />}
                      <span>{q.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none pt-2">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.answer}</ReactMarkdown>
                    <div className="mt-4 not-prose flex justify-end">
                       <Button variant={isLearned ? 'secondary' : 'default'} size="sm" onClick={() => handleMarkAsLearned(q.question)}>
                        <CheckCircle />
                        {isLearned ? "Mark as Unlearned" : "Mark as Learned"}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
