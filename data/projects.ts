export type Project = {
  slug: string; number: string; title: string; english: string;
  category: "视觉项目" | "空间与舞台" | "AI 实验";
  year: string; role: string; summary: string; cover: string; accent: string;
  overview: string; responsibilities: string[]; insight: string; result: string; gallery: string[];
};

export const projects: Project[] = [
  {
    slug:"zhangjiajie-liquor", number:"01", title:"张家界酒品牌重塑", english:"BRAND VISUAL IDENTITY", category:"视觉项目", year:"2026", role:"品牌策略 / VI / 包装",
    summary:"以张家界地貌、土家织锦与洞藏工艺为线索，重建统一且具有地域识别度的酒品牌视觉系统。", cover:"/assets/zhangjiajie.webp", accent:"#0d4a38",
    overview:"针对原品牌视觉陈旧、文旅属性辨识不足及年轻消费群体吸引力弱的问题，完成从调研、视觉策略到包装落地的系统重塑。",
    responsibilities:["用户与竞品调研","品牌标准字与视觉规范","瓶型及包装设计","宣传物料延展"],
    insight:"将奇峰轮廓、土家织锦和洞藏文化转译为瓶型、纹样和插画，而非停留在表层符号装饰。",
    result:"形成 48 页品牌 VI 手册、5 个包装 SKU 与 10+ 项宣传物料，覆盖线上线下 3 类品牌触点。",
    gallery:["/assets/z-analysis.webp","/assets/z-product.webp","/assets/z-gift.webp"],
  },
  {
    slug:"xiangwei-wuxia", number:"02", title:"湘味五侠 IP 形象设计", english:"IP & CULTURAL DESIGN", category:"视觉项目", year:"2026", role:"IP 设定 / 角色视觉 / 衍生",
    summary:"将五道经典湘菜拟人化为年轻、鲜明且可延展的角色系统。", cover:"/assets/xiangwei.webp", accent:"#d99826",
    overview:"项目以“湘味即乡味”为创意原点，将湘菜味觉特征、五行属性和江湖叙事结合，建立五位角色的身份与世界观。",
    responsibilities:["文化与菜品研究","角色设定","视觉统一与海报","场景及衍生品设计"],
    insight:"把味觉差异转化为角色性格与造型语言，使地方文化既亲切又具有传播性。",
    result:"完成五位核心角色、系列角色海报、情境场景和毛绒挂件等衍生应用。",
    gallery:["/assets/x-posters.webp","/assets/x-scene.webp","/assets/x-merch.webp"],
  },
  {
    slug:"warm-star-station", number:"03", title:"暖星驿站公益 APP UI", english:"PUBLIC SERVICE UI/UX", category:"视觉项目", year:"2026", role:"调研 / 信息架构 / UI",
    summary:"以公益透明、参与反馈和树木成长机制，建立清晰而温暖的公益参与体验。", cover:"/assets/warmstation.webp", accent:"#ff5959",
    overview:"围绕公益信息获取、过程透明与持续参与问题，设计从项目浏览、贡献记录到积分兑换的完整体验路径。",
    responsibilities:["问题与用户调研","信息架构","视觉规范","核心页面设计"],
    insight:"用树木成长映射参与进度，让抽象的公益贡献变为可见、可持续的正向反馈。",
    result:"完成视觉规范与关键页面设计，覆盖幼苗、中树、开花和结果四个成长阶段。",
    gallery:["/assets/w-research.webp","/assets/w-type.webp","/assets/warmstation.webp"],
  },
  {
    slug:"silk-road-stage", number:"04", title:"舞台布景｜丝路逐梦", english:"STAGE & SCENE DESIGN", category:"空间与舞台", year:"ARCHIVE", role:"舞台视觉 / 场景设计",
    summary:"围绕舞台叙事、空间层次与灯光关系展开的舞美视觉实践。", cover:"/assets/stage.webp", accent:"#265fcb",
    overview:"以表演视线、空间层次和灯光氛围为核心，构建舞台视觉方案。", responsibilities:["视觉概念","舞台场景设计","效果呈现"],
    insight:"在观演距离和表演动线限制下，通过明确轮廓与层次控制舞台视觉焦点。", result:"完成舞台主视觉与场景效果方案。", gallery:["/assets/stage.webp"],
  },
  {
    slug:"paper-cutting-exhibition", number:"05", title:"展厅设计｜这不是剪纸", english:"EXHIBITION DESIGN", category:"空间与舞台", year:"ARCHIVE", role:"展陈空间 / 视觉叙事",
    summary:"围绕苗族民间艺术进行空间转译，让传统图形进入当代展览语境。", cover:"/assets/exhibition.webp", accent:"#cf7180",
    overview:"以“这不是剪纸”为主题，通过展墙图形、空间动线与色彩系统组织民间艺术内容。", responsibilities:["主题视觉","空间规划","展墙与效果图"],
    insight:"保留传统图形的识别度，同时用更轻、更开放的空间语言降低理解门槛。", result:"完成入口及多个展区的空间效果设计。", gallery:["/assets/exhibition.webp"],
  },
  {
    slug:"interior-design", number:"06", title:"室内设计实践", english:"INTERIOR DESIGN", category:"空间与舞台", year:"ARCHIVE", role:"空间设计 / 效果表现",
    summary:"从居住需求、空间尺度与视觉氛围出发的室内设计实践。", cover:"/assets/interior.webp", accent:"#647892",
    overview:"围绕居住空间的功能组织、动线与整体氛围展开设计，并完成效果表现。", responsibilities:["空间布局","风格与材质","效果图表现"],
    insight:"在满足使用功能的基础上，以统一的色彩和材质关系建立安静、清晰的空间秩序。", result:"完成多空间室内效果方案。", gallery:["/assets/interior.webp"],
  },
  {
    slug:"ai-video-experiments", number:"07", title:"AI 视频与视觉实验", english:"AI VISUAL EXPERIMENTS", category:"AI 实验", year:"2026", role:"概念探索 / 生成 / 剪辑",
    summary:"让 AI 参与创意发散和风格验证，再通过人工筛选、后期与剪辑控制结果。", cover:"/assets/ai-workflow.webp", accent:"#e34435",
    overview:"包含西游神话、湘味江湖、张家界酒宣传片与小樽短片等 AI 影像练习。", responsibilities:["概念与提示词","视觉筛选","镜头衔接","后期剪辑"],
    insight:"AI 负责加速发散，设计判断仍用于控制叙事、品牌目标和最终品质。", result:"形成多支主题短片，并沉淀信息输入、归类、发散、判断和验证的协作流程。", gallery:["/assets/ai-workflow.webp"],
  },
];

export const categories = ["全部","视觉项目","空间与舞台","AI 实验"] as const;
export function getProject(slug:string) { return projects.find((project)=>project.slug===slug); }
