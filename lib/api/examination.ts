import { paginate, requireEngagement } from "@/lib/data/dummy";
import { ApiClientError } from "@/lib/api/types";
import type { Page } from "@/lib/api/types";
import type {
  ExaminationAsk,
  ExaminationDailyPulse,
  ExaminationThread,
} from "@/lib/types/examination";

export interface ListExaminationAsksParams {
  threadId?: string;
  limit?: number;
  offset?: number;
}

function mapAsk(raw: Record<string, unknown>): ExaminationAsk {
  return {
    id: String(raw.id ?? ""),
    askCode: String(raw.askCode ?? ""),
    askedAt: String(raw.askedAt ?? ""),
    responderName: (raw.responderName as string | null) ?? null,
    referenceText: (raw.referenceText as string | null) ?? null,
    questionText: String(raw.questionText ?? ""),
    responseText: (raw.responseText as string | null) ?? null,
    reaction: (raw.reaction as string | null) ?? null,
    idrLineId: (raw.idrLineId as string | null) ?? null,
    idrLineRef: (raw.idrLineRef as string | null) ?? null,
    adrLineId: (raw.adrLineId as string | null) ?? null,
    adrLineRef: (raw.adrLineRef as string | null) ?? null,
  };
}

function defaultPulse(): ExaminationDailyPulse {
  return {
    accepted: 0,
    probedFurther: 0,
    concerns: 0,
    followUps: 0,
    topConcerns: [],
  };
}

export async function listExaminationThreadsApi(
  engagementId: string,
): Promise<ExaminationThread[]> {
  const engagement = requireEngagement(engagementId);
  const threads = engagement.examination?.threads ?? [];
  return [...threads].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  ) as ExaminationThread[];
}

export async function listExaminationAsksApi(
  engagementId: string,
  params: ListExaminationAsksParams = {},
): Promise<Page<ExaminationAsk>> {
  const { threadId, limit = 50, offset = 0 } = params;
  const engagement = requireEngagement(engagementId);
  const exam = engagement.examination;

  if (!exam) {
    return paginate([], limit, offset);
  }

  let asks: ExaminationAsk[] = [];

  if (threadId) {
    const threadAsks = exam.asksByThread?.[threadId] ?? [];
    asks = threadAsks.map((raw) =>
      mapAsk(raw as unknown as Record<string, unknown>),
    );
  } else {
    for (const threadAsks of Object.values(exam.asksByThread ?? {})) {
      for (const raw of threadAsks) {
        asks.push(mapAsk(raw as unknown as Record<string, unknown>));
      }
    }
  }

  return paginate(asks, limit, offset);
}

export async function getExaminationDailyPulseApi(
  engagementId: string,
): Promise<ExaminationDailyPulse> {
  const engagement = requireEngagement(engagementId);
  const pulse = engagement.examination?.dailyPulse;
  if (!pulse) return defaultPulse();
  return {
    accepted: pulse.accepted ?? 0,
    probedFurther: pulse.probedFurther ?? 0,
    concerns: pulse.concerns ?? 0,
    followUps: pulse.followUps ?? 0,
    topConcerns: pulse.topConcerns ?? [],
  };
}

export async function getExaminationThreadApi(
  engagementId: string,
  threadId: string,
): Promise<ExaminationThread> {
  const threads = await listExaminationThreadsApi(engagementId);
  const thread = threads.find((t) => t.id === threadId);
  if (!thread) {
    throw new ApiClientError(
      `Examination thread not found: ${threadId}`,
      404,
      "EXAMINATION_THREAD_NOT_FOUND",
    );
  }
  return thread;
}
