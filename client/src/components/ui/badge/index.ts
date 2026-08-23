import { cva, type VariantProps } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 text-caption font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        // deduction·highlight 변형을 지웠다: 테마에 그 이름의 색이 없어
        // bg-deduction/bg-highlight/text-*-foreground 네 클래스 모두 CSS 규칙이
        // 생성되지 않았다. 호출부도 0곳이라 화면에는 흔적이 없었지만, 남겨두면
        // 다음 사람이 골랐을 때 테두리만 있는 배지가 나온다.
        // 70% 알파 + 흰 글자는 라이트 3.37:1 / 다크 3.46:1로 미달 → 불투명 배경 + 짝 토큰
        neutral: "border-border/50 bg-muted-foreground text-background",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

export { default as Badge } from "./Badge.vue";
