export interface Category {
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export const categories: Category[] = [
  {
    name: "수급자격",
    slug: "수급자격",
    icon: "UserCheck",
    description: "기초연금을 받을 수 있는 자격 요건을 확인하세요",
  },
  {
    name: "신청방법",
    slug: "신청방법",
    icon: "FileText",
    description: "기초연금 신청 절차와 필요 서류를 안내합니다",
  },
  {
    name: "지급금액",
    slug: "지급금액",
    icon: "Wallet",
    description: "2025년 기초연금 지급 금액과 산정 방식",
  },
  {
    name: "소득인정액",
    slug: "소득인정액",
    icon: "BarChart3",
    description: "소득인정액 산정 기준과 계산 방법을 알아보세요",
  },
  {
    name: "자주 묻는 질문",
    slug: "자주묻는질문",
    icon: "HelpCircle",
    description: "기초연금에 대해 자주 묻는 질문과 답변",
  },
  {
    name: "관련 제도",
    slug: "관련제도",
    icon: "Building2",
    description: "기초연금과 함께 알아두면 좋은 복지 제도",
  },
];
