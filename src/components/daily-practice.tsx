
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  generatePracticeQuestion,
  PracticeQuestionOutput,
} from "@/ai/flows/practice-question-generator";
import { getCodeHint, GetCodeHintOutput } from "@/ai/flows/ai-code-assistant";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Bot,
  Sparkles,
  Send,
  Lightbulb,
  GraduationCap,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const practiceFormSchema = z.object({
  skillLevel: z.enum(["Beginner", "Intermediate", "Advanced"]),
  technology: z.enum([
    "SQL",
    "Python",
    "Power BI",
    "Excel",
    "Statistics",
    "Tableau",
  ]),
});

type ActivityHistory = {
  date: string;
  count: number;
}[];

export function DailyPractice() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [practiceData, setPracticeData] =
    useState<PracticeQuestionOutput | null>(null);
  const [submissionResult, setSubmissionResult] =
    useState<EvaluateSolutionOutput | null>(null);
  const [hintData, setHintData] = useState<GetCodeHintOutput | null>(null);
  const [userCode, setUserCode] = useState("");
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const { toast } = useToast();

  const [, setSolvedCount] = useLocalStorage("challengesSolved", 0);
  const [, setActivityHistory] = useLocalStorage<ActivityHistory>(
    "activityHistory",
    []
  );

  const form = useForm<z.infer<typeof practiceFormSchema>>({
    resolver: zodResolver(practiceFormSchema),
    defaultValues: {
      skillLevel: "Beginner",
      technology: "SQL",
    },
  });

  const resetChallengeState = () => {
    setPracticeData(null);
    setHintData(null);
    setSubmissionResult(null);
    setUserCode("");
    setIncorrectAttempts(0);
  };

  async function onSubmit(values: z.infer<typeof practiceFormSchema>) {
    setIsLoading(true);
    resetChallengeState();
    try {
      const result = await generatePracticeQuestion(values);
      setPracticeData(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error Generating Question",
        description:
          "The AI failed to generate a practice question. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmitSolution() {
    if (!practiceData) return;
    setIsSubmitting(true);
    setHintData(null);
    setSubmissionResult(null);

    try {
      const result = await evaluateSolution({
        exerciseDescription: practiceData.description,
        solution: practiceData.solution,
        userAnswer: userCode,
        technology: form.getValues("technology"),
      });
      setSubmissionResult(result);

      if (result.isCorrect) {
        setIncorrectAttempts(0);
        setSolvedCount((prevCount) => prevCount + 1);
        toast({
          title: "Correct!",
          description: `You scored ${result.score}/100. Well done!`,
        });
        const d = new Date();
        const today = `${d.getFullYear()}-${String(
          d.getMonth() + 1
        ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

        setActivityHistory((prev) => {
          const todayEntry = prev.find((entry) => entry.date === today);
          if (todayEntry) {
            return prev.map((entry) =>
              entry.date === today
                ? { ...entry, count: entry.count + 1 }
                : entry
            );
          } else {
            return [...prev, { date: today, count: 1 }];
          }
        });
      } else {
        setIncorrectAttempts((prev) => prev + 1);
        toast({
          variant: "destructive",
          title: "Not Quite",
          description: "Keep trying! You can do it.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error Evaluating Solution",
        description: "The AI failed to evaluate your answer. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGetHint() {
    if (!practiceData) return;
    setIsHintLoading(true);
    setHintData(null);
    try {
      const result = await getCodeHint({
        exerciseDescription: practiceData.description,
        userCode: userCode,
        programmingLanguage: form.getValues("technology"),
      });
      setHintData(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error Getting Hint",
        description: "The AI failed to provide a hint. Please try again.",
      });
    } finally {
      setIsHintLoading(false);
    }
  }

  const showHintButton = incorrectAttempts >= 5;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Daily Practice Challenge</CardTitle>
        <CardDescription>
          Select your skill level and technology to get a new challenge.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg"
          >
            <FormField
              control={form.control}
              name="skillLevel"
              render={({ field }) => (
                <FormItem className="flex-1 w-full">
                  <FormLabel>Skill Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select skill level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="technology"
              render={({ field }) => (
                <FormItem className="flex-1 w-full">
                  <FormLabel>Technology</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select technology" />
                      </SelectTrigger>
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-full sm:w-auto self-end">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-gradient-pink to-gradient-orange text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Sparkles className="mr-2 h-4 w-4" />
                New Challenge
              </Button>
            </div>
          </form>
        </Form>

        {isLoading && (
          <div className="flex items-center justify-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">
              Generating your challenge...
            </p>
          </div>
        )}

        {practiceData && (
          <div className="space-y-6">
            <Separator />
            <Card>
              <CardHeader>
                <CardTitle>Your Challenge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {practiceData.description}
                </p>

                {practiceData.table && (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {practiceData.table.headers.map((header) => (
                            <TableHead key={header}>{header}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {practiceData.table.rows.map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <TableCell key={cellIndex}>{cell}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="code-editor">Your Solution</Label>
              <div className="relative rounded-lg bg-gradient-to-r from-gradient-pink via-gradient-orange to-gradient-yellow p-px animate-animated-gradient [background-size:400%]">
                <div className="rounded-[7px] bg-card p-4">
                  <Textarea
                    id="code-editor"
                    placeholder="Write your code or describe your steps here..."
                    className="font-code h-48 w-full resize-none bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                  />
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={handleSubmitSolution}
                      disabled={isSubmitting || !userCode}
                      className="bg-gradient-to-r from-gradient-pink to-gradient-orange text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Submit Solution
                    </Button>
                    {showHintButton && (
                      <Button
                        onClick={handleGetHint}
                        disabled={isHintLoading}
                        variant="secondary"
                      >
                        {isHintLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Lightbulb className="mr-2 h-4 w-4" />
                        )}
                        Get Hint
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {(isHintLoading || isSubmitting) && (
              <div className="flex items-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">AI is thinking...</p>
              </div>
            )}

            {submissionResult && (
              <Alert
                variant={submissionResult.isCorrect ? "default" : "destructive"}
              >
                <GraduationCap className="h-4 w-4" />
                <AlertTitle>
                  Evaluation Result - Score: {submissionResult.score}/100
                </AlertTitle>
                <AlertDescription>
                  {submissionResult.feedback}
                </AlertDescription>
              </Alert>
            )}

            {hintData && (
              <Alert>
                <Bot className="h-4 w-4" />
                <AlertTitle>AI Code Assistant</AlertTitle>
                <AlertDescription className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Hint</h4>
                    <p>{hintData.hint}</p>
                  </div>
                  {hintData.solution && (
                    <div>
                      <h4 className="font-semibold mb-2">
                        Suggested Solution
                      </h4>
                      <pre className="bg-muted p-3 rounded-md font-code text-sm overflow-x-auto">
                        <code>{hintData.solution}</code>
                      </pre>
                    </div>
                  )}
                  {hintData.explanation && (
                    <div>
                      <h4 className="font-semibold mb-2">Explanation</h4>
                      <p>{hintData.explanation}</p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
