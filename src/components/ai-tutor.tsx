"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  generateTutorial,
  GenerateTutorialOutput,
} from "@/ai/flows/generate-tutorial";
import {
  evaluateSolution,
  EvaluateSolutionOutput,
} from "@/ai/flows/evaluate-solution";
import useLocalStorage from "@/hooks/use-local-storage";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Sparkles,
  Bookmark,
  CheckCircle,
  XCircle,
  ChevronRight,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const tutorFormSchema = z.object({
  skillLevel: z.enum(["Beginner", "Intermediate", "Advanced"]),
  topic: z.enum([
    "SQL",
    "Python",
    "Power BI",
    "Excel",
    "Statistics",
    "Tableau",
  ]),
});

type UserAnswers = {
  mcqs: { [key: number]: string };
  openEnded: { [key: number]: string };
};

type AssessmentResult = {
  isCorrect: boolean;
  feedback: string;
};

type AssessmentResults = {
  mcqs: boolean[];
  openEnded: AssessmentResult[];
  allCorrect: boolean;
};

export function AiTutor() {
  const [view, setView] = useState<"FORM" | "GENERATING" | "TUTORIAL">(
    "FORM"
  );
  const [tutorialData, setTutorialData] =
    useState<GenerateTutorialOutput | null>(null);
  const [formValues, setFormValues] = useState({
    topic: "SQL",
    skillLevel: "Beginner",
  });
  const [completedChapters, setCompletedChapters] = useLocalStorage<boolean[]>(
    `progress-${formValues.topic}-${formValues.skillLevel}`,
    []
  );
  const [activeChapter, setActiveChapter] = useState<string | undefined>();
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({
    mcqs: {},
    openEnded: {},
  });
  const [assessmentResults, setAssessmentResults] =
    useState<AssessmentResults | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof tutorFormSchema>>({
    resolver: zodResolver(tutorFormSchema),
    defaultValues: formValues,
  });

  useEffect(() => {
    const key = `progress-${formValues.topic}-${formValues.skillLevel}`;
    const stored = localStorage.getItem(key);
    setCompletedChapters(stored ? JSON.parse(stored) : []);
  }, [formValues, setCompletedChapters]);
  
  useEffect(() => {
    setUserAnswers({ mcqs: {}, openEnded: {} });
    setAssessmentResults(null);
  }, [activeChapter]);

  async function onSubmit(values: z.infer<typeof tutorFormSchema>) {
    setView("GENERATING");
    setTutorialData(null);
    setAssessmentResults(null);
    setFormValues(values);

    try {
      const result = await generateTutorial(values);
      setTutorialData(result);
      setCompletedChapters(new Array(result.chapters.length).fill(false));
      setView("TUTORIAL");
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error Generating Tutorial",
        description:
          "The AI failed to generate a tutorial. Please try again.",
      });
      setView("FORM");
    }
  }

  const handleAnswerChange = (
    type: "mcqs" | "openEnded",
    index: number,
    value: string
  ) => {
    setUserAnswers((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [index]: value,
      },
    }));
  };

  const handleSubmitAssessment = async (chapterIndex: number) => {
    if (!tutorialData) return;
    setIsEvaluating(true);
    setAssessmentResults(null);

    const chapter = tutorialData.chapters[chapterIndex];
    const { mcqs, openEndedQuestions } = chapter.assessment;

    const mcqResults = mcqs.map(
      (mcq, index) => userAnswers.mcqs[index] === mcq.answer
    );

    const evaluationPromises = openEndedQuestions.map(async (q, index) => {
      const userAnswer = userAnswers.openEnded[index] || "";
      if (!userAnswer)
        return { isCorrect: false, feedback: "No answer provided.", score: 0 };
      return evaluateSolution({
        exerciseDescription: q.question,
        solution: q.solution,
        userAnswer,
        technology: formValues.topic,
      });
    });

    try {
      const openEndedResults = await Promise.all(evaluationPromises);
      const allCorrect =
        mcqResults.every(Boolean) && openEndedResults.every((r) => r.isCorrect);

      setAssessmentResults({ mcqs: mcqResults, openEnded: openEndedResults, allCorrect });

      if (allCorrect) {
        toast({
          title: "Chapter Complete!",
          description: "Great job! You've unlocked the next chapter.",
        });
        const newProgress = [...completedChapters];
        newProgress[chapterIndex] = true;
        setCompletedChapters(newProgress);
        setUserAnswers({ mcqs: {}, openEnded: {} }); // Reset answers
      } else {
        toast({
          variant: "destructive",
          title: "Not Quite",
          description: "Some answers were incorrect. Review the feedback and try again.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Evaluation Error",
        description:
          "There was an error evaluating your answers. Please try again.",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const renderInitialForm = () => (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>AI Tutor</CardTitle>
        <CardDescription>
          Select a topic and skill level to generate a custom, interactive course.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg"
          >
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem className="flex-1 w-full">
                  <FormLabel>Topic</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SQL">SQL</SelectItem>
                      <SelectItem value="Python">Python</SelectItem>
                      <SelectItem value="Power BI">Power BI</SelectItem>
                      <SelectItem value="Excel">Excel</SelectItem>
                      <SelectItem value="Statistics">Statistics</SelectItem>
                      <SelectItem value="Tableau">Tableau</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="skillLevel"
              render={({ field }) => (
                <FormItem className="flex-1 w-full">
                  <FormLabel>Skill Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <div className="w-full sm:w-auto self-end">
              <Button type="submit" className="w-full bg-gradient-to-r from-gradient-pink to-gradient-orange text-primary-foreground">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Course
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  const renderGeneratingView = () => (
    <div className="flex flex-col items-center justify-center p-10 space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-lg text-muted-foreground">
        Your personal tutor is building your course...
      </p>
      <p className="text-sm text-muted-foreground">(This may take a moment)</p>
    </div>
  );

  const renderTutorialView = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">{tutorialData?.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{tutorialData?.introduction}</p>
      </div>
      <Accordion type="single" collapsible value={activeChapter} onValueChange={setActiveChapter}>
        {tutorialData?.chapters.map((chapter, index) => {
          const isCompleted = completedChapters[index];
          const isLocked = index > 0 && !completedChapters[index - 1];
          const isCurrentAssessment = activeChapter === `chapter-${index}`;

          return (
            <AccordionItem key={index} value={`chapter-${index}`} disabled={isLocked}>
              <AccordionTrigger className={`flex items-center justify-between p-4 rounded-lg ${isLocked ? 'bg-muted/50' : 'bg-card'}`}>
                <div className="flex items-center gap-4">
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Bookmark className={`h-5 w-5 ${isLocked ? 'text-muted-foreground' : 'text-primary'}`} />
                  )}
                  <span className="text-lg font-medium">{chapter.title}</span>
                </div>
                {isLocked && <span className="text-xs text-muted-foreground mr-4">Locked</span>}
              </AccordionTrigger>
              <AccordionContent className="p-4 space-y-6">
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{chapter.content}</ReactMarkdown>
                </div>
                {!isCompleted && (
                  <Card className="bg-secondary/50 mt-6">
                    <CardHeader>
                      <CardTitle>Test Your Knowledge</CardTitle>
                      <CardDescription>Answer all questions correctly to unlock the next chapter.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Multiple Choice Questions</h3>
                        <div className="space-y-6">
                          {chapter.assessment.mcqs.map((mcq, mcqIndex) => (
                            <div key={mcqIndex} className="p-4 rounded-lg border bg-background/50">
                              <p className="font-medium leading-relaxed text-accent-foreground">{mcqIndex + 1}. {mcq.question}</p>
                              <RadioGroup onValueChange={(value) => handleAnswerChange("mcqs", mcqIndex, value)} className="mt-3 space-y-2">
                                {mcq.options.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={`mcq-${index}-${mcqIndex}-${optionIndex}`} />
                                    <Label htmlFor={`mcq-${index}-${mcqIndex}-${optionIndex}`}>{option}</Label>
                                  </div>
                                ))}
                              </RadioGroup>
                              {assessmentResults && isCurrentAssessment && !assessmentResults.mcqs[mcqIndex] && (
                                <Alert variant="destructive" className="mt-4">
                                  <XCircle className="h-4 w-4" />
                                  <AlertTitle>Incorrect</AlertTitle>
                                  <AlertDescription>The correct answer was: {mcq.answer}</AlertDescription>
                                </Alert>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Open-Ended Questions</h3>
                        <div className="space-y-6">
                          {chapter.assessment.openEndedQuestions.map((q, qIndex) => (
                            <div key={qIndex} className="p-4 rounded-lg border bg-background/50">
                              <Label htmlFor={`open-${index}-${qIndex}`} className="font-medium leading-relaxed block text-accent-foreground">{qIndex + 1}. {q.question}</Label>
                              <Textarea id={`open-${index}-${qIndex}`} onChange={(e) => handleAnswerChange("openEnded", qIndex, e.target.value)} className="mt-3"/>
                              {assessmentResults && isCurrentAssessment && !assessmentResults.openEnded[qIndex].isCorrect && (
                                <Alert variant="destructive" className="mt-4">
                                  <XCircle className="h-4 w-4" />
                                  <AlertTitle>Incorrect</AlertTitle>
                                  <AlertDescription>{assessmentResults.openEnded[qIndex].feedback}</AlertDescription>
                                </Alert>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button onClick={() => handleSubmitAssessment(index)} disabled={isEvaluating} className="mt-6 w-full sm:w-auto">
                        {isEvaluating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Answers
                      </Button>
                    </CardContent>
                  </Card>
                )}
                 {isCompleted && (
                    <Alert variant="default" className="border-green-500 mt-4">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertTitle>Chapter Completed!</AlertTitle>
                      <AlertDescription>You've successfully passed the assessment for this chapter.</AlertDescription>
                    </Alert>
                  )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
      <div className="mt-8">
        <h2 className="text-2xl font-bold">Conclusion</h2>
        <div className="prose dark:prose-invert max-w-none mt-2">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{tutorialData?.conclusion}</ReactMarkdown>
        </div>
      </div>
      <Button onClick={() => setView('FORM')} className="mt-8">
        <Sparkles className="mr-2 h-4 w-4" />
        Create a New Course
      </Button>
    </div>
  );

  return (
    <div>
      {view === "FORM" && renderInitialForm()}
      {view === "GENERATING" && renderGeneratingView()}
      {view === "TUTORIAL" && tutorialData && renderTutorialView()}
    </div>
  );
}
