import { ref } from "vue";

interface DayContribution {
    date: string;
    count: number;
    level: number;
}

interface ContributionResponse {
    total: { lastYear: number } & Record<string, number>;
    contributions: DayContribution[];
}

export type LoadState = "loading" | "success" | "error";

/**
 * 拉取 GitHub 过去一年的每日贡献，并整理为热力图矩阵。
 *
 * 输出 matrix[行][列]：
 * - 行 = 星期几（0 = 周日 … 6 = 周六），共 7 行
 * - 列 = 周，从最早到最近
 * - null 表示该格没有对应日期（首末周的补位）
 */
export function useContributions(user: string) {
    /** 7 行 × N 列的贡献计数矩阵 */
    const matrix = ref<(number | null)[][]>([]);
    /** 过去一年总贡献 */
    const total = ref(0);
    const state = ref<LoadState>("loading");

    /** 将扁平的每日数据整理成 7×N 矩阵 */
    const buildMatrix = (days: DayContribution[]): (number | null)[][] => {
        // 初始化 7 行
        const rows: (number | null)[][] = Array.from({ length: 7 }, () => []);
        if (days.length === 0) return rows;

        // 第一天前面补 null，使其对齐到所在周的星期
        const firstDay = new Date(days[0].date).getDay();
        for (let r = 0; r < firstDay; r++) {
            rows[r].push(null);
        }

        // 按星期分配到对应行
        for (const day of days) {
            const weekday = new Date(day.date).getDay();
            rows[weekday].push(day.count);
        }

        // 末尾补齐到等长
        const maxLen = Math.max(...rows.map((r) => r.length));
        for (const r of rows) {
            while (r.length < maxLen) r.push(null);
        }
        return rows;
    };

    const fetchContributions = async (): Promise<void> => {
        state.value = "loading";
        try {
            const url = `https://github-contributions-api.jogruber.de/v4/${user}?y=last`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Contributions API ${res.status}`);

            const data = (await res.json()) as ContributionResponse;
            matrix.value = buildMatrix(data.contributions);
            total.value = data.total.lastYear;
            state.value = "success";
        } catch {
            matrix.value = [];
            total.value = 0;
            state.value = "error";
        }
    };

    fetchContributions();

    return {
        matrix,
        total,
        state,
        refresh: fetchContributions,
    };
}
