import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Info, 
  MessageSquare, 
  Target, 
  Zap, 
  RotateCcw, 
  Send,
  Loader2,
  Trophy,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { cn } from './lib/utils';
import { askGolfCoach } from './services/golfService';

// --- Types ---
type Tab = 'mechanics' | 'drills' | 'equipment';

interface SwingPhase {
  id: string;
  title: string;
  description: string;
  keyPoints: string[];
  focus: string;
  commonFault: string;
}

interface Drill {
  id: string;
  title: string;
  description: string;
  steps: string[];
  benefit: string;
}

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  description: string;
  proTip: string;
}

// --- Data ---
const DRILLS: Drill[] = [
  {
    id: 'alignment-stick',
    title: '얼라인먼트 스틱 드릴',
    description: '올바른 조준과 스윙 궤도를 익히기 위한 가장 기본적인 연습입니다.',
    steps: [
      '스틱 하나는 타겟 라인과 평행하게 발 앞에 둡니다.',
      '다른 하나는 공 뒤쪽에 스윙 궤도 방향으로 비스듬히 꽂습니다.',
      '백스윙 시 클럽이 스틱을 건드리지 않도록 주의하며 연습합니다.'
    ],
    benefit: '정확한 방향성과 일관된 스윙 궤도 형성'
  },
  {
    id: 'towel-drill',
    title: '겨드랑이 수건 드릴',
    description: '몸통과 팔의 일체감을 높여주는 연습입니다.',
    steps: [
      '작은 수건을 양쪽 겨드랑이에 끼웁니다.',
      '수건이 떨어지지 않도록 주의하며 하프 스윙을 반복합니다.',
      '상체 회전의 느낌을 충분히 익힙니다.'
    ],
    benefit: '팔로만 치는 스윙(Arm swing) 방지 및 몸통 회전 극대화'
  },
  {
    id: 'pause-drill',
    title: '정지 드릴 (Pause at Top)',
    description: '스윙의 템포와 전환(Transition) 타이밍을 잡는 연습입니다.',
    steps: [
      '백스윙 탑에서 2초간 멈춥니다.',
      '하체의 리드로 다운스윙을 시작하는 것을 느낍니다.',
      '급격한 전환을 방지하고 부드러운 가속을 익힙니다.'
    ],
    benefit: '스윙 시퀀스 개선 및 비거리 향상'
  }
];

const EQUIPMENT: EquipmentItem[] = [
  {
    id: 'driver',
    name: '드라이버 (Driver)',
    category: 'Woods',
    description: '가장 긴 비거리를 내기 위한 클럽입니다. 티샷에서 주로 사용됩니다.',
    proTip: '공을 왼발 뒤꿈치 선상에 두고 상향 타격(Ascending blow)을 하세요.'
  },
  {
    id: 'irons',
    name: '아이언 (Irons)',
    category: 'Irons',
    description: '정확한 거리 조절과 그린 공략을 위한 클럽입니다.',
    proTip: '공을 먼저 타격하고 앞 땅에 디봇(Divot)을 만드는 하향 타격이 핵심입니다.'
  },
  {
    id: 'wedges',
    name: '웨지 (Wedges)',
    category: 'Short Game',
    description: '그린 주변에서의 정교한 샷과 벙커 탈출을 위한 클럽입니다.',
    proTip: '손목 사용을 억제하고 몸통의 회전으로 거리를 조절하세요.'
  },
  {
    id: 'putter',
    name: '퍼터 (Putter)',
    category: 'Putting',
    description: '홀컵에 공을 넣기 위한 가장 중요한 클럽입니다.',
    proTip: '시계추 운동(Pendulum motion)을 상상하며 일정한 템포를 유지하세요.'
  }
];

const SWING_PHASES: SwingPhase[] = [
  {
    id: 'address',
    title: '어드레스 (Address)',
    description: '스윙의 기초가 되는 준비 자세입니다. 올바른 정렬과 균형이 핵심입니다.',
    keyPoints: [
      '발 너비는 어깨 너비 정도로 유지',
      '체중은 양발의 앞부분(Balls of feet)에 균등하게 배분',
      '척추 각도는 곧게 펴고 엉덩이 관절(Hip hinge)을 이용해 숙임',
      '팔은 어깨에서 자연스럽게 아래로 늘어뜨림'
    ],
    focus: '균형과 정렬 (Balance & Alignment)',
    commonFault: '너무 경직된 자세 또는 구부정한 등'
  },
  {
    id: 'takeaway',
    title: '테이크어웨이 (Takeaway)',
    description: '스윙의 시작 단계로, 클럽과 몸이 하나가 되어 움직여야 합니다.',
    keyPoints: [
      '낮고 길게 클럽을 뒤로 뺌',
      '삼각형(어깨와 양손)을 유지하며 일체감 있게 시작',
      '손목 코킹을 서두르지 않음',
      '클럽 페이스가 척추 각도와 평행을 유지'
    ],
    focus: '일체감 (One-piece Takeaway)',
    commonFault: '손목만을 이용해 클럽을 급격히 들어올림'
  },
  {
    id: 'backswing',
    title: '백스윙 (Backswing)',
    description: '에너지를 축적하는 과정입니다. 상체의 회전과 하체의 버팀이 중요합니다.',
    keyPoints: [
      '왼쪽 어깨가 오른발 위까지 오도록 충분히 회전',
      '오른쪽 무릎의 각도를 유지하며 하체를 견고하게 고정',
      '팔과 몸통 사이의 간격을 유지',
      '체중이 오른발 안쪽으로 자연스럽게 이동'
    ],
    focus: '꼬임 (Coiling)',
    commonFault: '스웨이(Sway) - 몸이 오른쪽으로 밀려나가는 현상'
  },
  {
    id: 'top',
    title: '탑 오브 스윙 (Top of Swing)',
    description: '전환(Transition)이 일어나기 직전의 정점입니다.',
    keyPoints: [
      '왼쪽 손목이 평평하게 유지됨 (Flat left wrist)',
      '클럽 샤프트가 타겟 라인과 평행하거나 약간 안쪽을 향함',
      '충분한 어깨 회전이 완료된 상태',
      '등이 타겟을 향하는 느낌'
    ],
    focus: '정점과 전환 (Peak & Transition)',
    commonFault: '오버 스윙 또는 크로스 오버'
  },
  {
    id: 'downswing',
    title: '다운스윙 (Downswing)',
    description: '축적된 에너지를 클럽 헤드로 전달하는 가속 단계입니다.',
    keyPoints: [
      '하체의 리드(Hip bump/rotation)로 시작',
      '손목의 코킹을 최대한 유지하며 내려옴 (Lagging)',
      '클럽이 몸 안쪽에서 접근 (Inside-out path)',
      '머리 위치를 고정하여 척추 각도 유지'
    ],
    focus: '시퀀스 (Sequencing)',
    commonFault: '캐스팅(Casting) - 손목이 일찍 풀리는 현상'
  },
  {
    id: 'impact',
    title: '임팩트 (Impact)',
    description: '가장 중요한 순간으로, 클럽이 공과 만나는 찰나입니다.',
    keyPoints: [
      '핸드 퍼스트(Hand first) 자세로 샤프트가 타겟 쪽으로 기울어짐',
      '체중의 70-80%가 왼발에 실림',
      '클럽 페이스가 타겟과 스퀘어를 이룸',
      '시선은 공이 있던 자리를 유지'
    ],
    focus: '정확한 타격 (Compression)',
    commonFault: '스쿠핑(Scooping) - 공을 퍼올리려는 동작'
  },
  {
    id: 'follow',
    title: '팔로우스루 (Follow-through)',
    description: '임팩트 이후 에너지가 방출되는 과정입니다.',
    keyPoints: [
      '양팔을 타겟 방향으로 최대한 뻗어줌 (Extension)',
      '몸통이 타겟을 향해 완전히 회전',
      '오른쪽 어깨가 타겟을 향하도록 깊게 회전',
      '클럽 헤드 속도가 최대치를 지나 자연스럽게 감속'
    ],
    focus: '확장 (Extension)',
    commonFault: '치킨 윙(Chicken Wing) - 왼팔 팔꿈치가 바깥으로 빠지는 현상'
  },
  {
    id: 'finish',
    title: '피니시 (Finish)',
    description: '스윙의 완성입니다. 균형 잡힌 피니시는 좋은 스윙의 증거입니다.',
    keyPoints: [
      '체중이 왼발 바깥쪽에 완전히 실림',
      '배꼽이 타겟을 정면으로 바라봄',
      '오른발 끝으로 지면을 살짝 찍고 있는 상태',
      '클럽이 등 뒤로 자연스럽게 넘어감'
    ],
    focus: '균형 (Balance)',
    commonFault: '뒤로 넘어지거나 균형을 잃음'
  }
];

// --- Components ---

const PhaseIndicator = ({ activeIndex }: { activeIndex: number }) => {
  return (
    <div className="flex justify-between w-full mb-8 px-4 overflow-x-auto pb-4 scrollbar-hide">
      {SWING_PHASES.map((phase, index) => (
        <div 
          key={phase.id} 
          className="flex flex-col items-center min-w-[80px] relative"
        >
          <div 
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 z-10",
              index <= activeIndex ? "bg-emerald-600 text-white" : "bg-zinc-200 text-zinc-500"
            )}
          >
            {index + 1}
          </div>
          <span className={cn(
            "text-[10px] mt-2 font-medium uppercase tracking-wider whitespace-nowrap",
            index === activeIndex ? "text-emerald-600" : "text-zinc-400"
          )}>
            {phase.id}
          </span>
          {index < SWING_PHASES.length - 1 && (
            <div className={cn(
              "absolute top-4 left-[60%] w-full h-[2px] -z-0",
              index < activeIndex ? "bg-emerald-600" : "bg-zinc-200"
            )} />
          )}
        </div>
      ))}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('mechanics');
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentPhase = SWING_PHASES[currentPhaseIndex];

  const nextPhase = () => {
    setCurrentPhaseIndex((prev) => (prev + 1) % SWING_PHASES.length);
  };

  const prevPhase = () => {
    setCurrentPhaseIndex((prev) => (prev - 1 + SWING_PHASES.length) % SWING_PHASES.length);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    const aiResponse = await askGolfCoach(userMsg);
    setChatHistory(prev => [...prev, { role: 'ai', content: aiResponse || '죄송합니다. 답변을 생성하지 못했습니다.' }]);
    setIsTyping(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Trophy size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900">GOLF SWING PRO</h1>
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Mechanism Analyzer</p>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6 text-[10px] md:text-xs font-semibold uppercase tracking-widest overflow-x-auto scrollbar-hide">
          <span 
            onClick={() => setActiveTab('mechanics')}
            className={cn(
              "cursor-pointer transition-colors whitespace-nowrap",
              activeTab === 'mechanics' ? "text-emerald-600" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            Mechanics
          </span>
          <span 
            onClick={() => setActiveTab('drills')}
            className={cn(
              "cursor-pointer transition-colors whitespace-nowrap",
              activeTab === 'drills' ? "text-emerald-600" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            Drills
          </span>
          <span 
            onClick={() => setActiveTab('equipment')}
            className={cn(
              "cursor-pointer transition-colors whitespace-nowrap",
              activeTab === 'equipment' ? "text-emerald-600" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            Equipment
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-10">
        
        {/* Left Column: Content Area */}
        <div className="lg:col-span-7 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'mechanics' && (
              <motion.section 
                key="mechanics"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-100"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold tracking-tight">Swing Sequence</h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={prevPhase}
                      className="p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-900"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={nextPhase}
                      className="p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-900"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>
                </div>

                <PhaseIndicator activeIndex={currentPhaseIndex} />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPhase.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1 p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Activity size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-zinc-900">{currentPhase.title}</h3>
                        <p className="text-zinc-500 mt-1 leading-relaxed">{currentPhase.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                          <Zap size={14} className="text-amber-500" /> Key Checkpoints
                        </h4>
                        <ul className="space-y-3">
                          {currentPhase.keyPoints.map((point, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-zinc-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-6">
                        <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-2">
                            <Target size={14} className="text-emerald-600" /> Core Focus
                          </h4>
                          <p className="text-sm font-semibold text-zinc-900">{currentPhase.focus}</p>
                        </div>

                        <div className="p-5 bg-rose-50 rounded-2xl border border-rose-100">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-rose-400 mb-2 flex items-center gap-2">
                            <Info size={14} /> Common Fault
                          </h4>
                          <p className="text-sm font-medium text-rose-700">{currentPhase.commonFault}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.section>
            )}

            {activeTab === 'drills' && (
              <motion.section 
                key="drills"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold tracking-tight px-2">Training Drills</h2>
                <div className="grid grid-cols-1 gap-4">
                  {DRILLS.map((drill) => (
                    <div key={drill.id} className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-zinc-900">{drill.title}</h3>
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                          <Zap size={20} />
                        </div>
                      </div>
                      <p className="text-zinc-500 text-sm leading-relaxed">{drill.description}</p>
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">연습 방법</h4>
                        <ul className="space-y-2">
                          {drill.steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-zinc-700">
                              <span className="font-bold text-emerald-600">{i + 1}.</span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <p className="text-xs font-bold text-emerald-700">효과: {drill.benefit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {activeTab === 'equipment' && (
              <motion.section 
                key="equipment"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold tracking-tight px-2">Equipment Guide</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {EQUIPMENT.map((item) => (
                    <div key={item.id} className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 space-y-4 flex flex-col">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-zinc-900">{item.name}</h3>
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-zinc-100 text-zinc-500 rounded-full">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-zinc-500 text-sm flex-1">{item.description}</p>
                      <div className="pt-4 border-t border-zinc-50">
                        <p className="text-xs font-bold text-emerald-600 flex items-center gap-2">
                          <Info size={14} /> Pro Tip
                        </p>
                        <p className="text-xs text-zinc-700 mt-1 italic">"{item.proTip}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Tips Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { 
                title: 'Grip (그립)', 
                icon: <Zap size={18} />, 
                desc: '클럽과 몸의 유일한 연결점입니다.',
                details: [
                  '뉴트럴: 양손의 V자가 오른쪽 어깨를 향함',
                  '스트롱: 훅 방지 및 비거리 향상에 유리',
                  '압력: 새를 잡듯 부드럽게 (1~10 중 3-4 정도)'
                ]
              },
              { 
                title: 'Tempo (템포)', 
                icon: <RotateCcw size={18} />, 
                desc: '일관된 스윙의 핵심 리듬입니다.',
                details: [
                  '3:1 비율: 백스윙(3) 대 다운스윙(1)',
                  '탑에서의 여유: 급격한 전환 방지',
                  '일정한 호흡: 스윙 시작 전 내뱉는 호흡'
                ]
              },
              { 
                title: 'Release (릴리스)', 
                icon: <Activity size={18} />, 
                desc: '임팩트 시 에너지를 폭발시킵니다.',
                details: [
                  '스퀘어 페이스: 임팩트 시 클럽 면 정렬',
                  '팔뚝 회전: 자연스러운 로테이션 유도',
                  '익스텐션: 공을 타겟 쪽으로 던지는 느낌'
                ]
              }
            ].map((tip, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm hover:border-emerald-200 transition-all cursor-default group">
                <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors mb-4">
                  {tip.icon}
                </div>
                <h4 className="font-bold text-zinc-900 text-lg">{tip.title}</h4>
                <p className="text-xs text-emerald-600 font-semibold mt-1 mb-3">{tip.desc}</p>
                <ul className="space-y-2">
                  {tip.details.map((detail, idx) => (
                    <li key={idx} className="text-[11px] text-zinc-500 leading-tight flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-zinc-300 mt-1.5 shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        </div>

        {/* Right Column: AI Coach */}
        <div className="lg:col-span-5 flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
          <div className="flex-1 bg-white rounded-3xl shadow-sm border border-zinc-100 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                  <MessageSquare size={16} />
                </div>
                <h3 className="font-bold tracking-tight">AI Swing Coach</h3>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Online
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {chatHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300">
                    <MessageSquare size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">무엇이든 물어보세요</p>
                    <p className="text-xs text-zinc-500 mt-1">"슬라이스를 교정하려면 어떻게 해야 하나요?"<br/>"비거리를 늘리는 메카니즘이 궁금해요."</p>
                  </div>
                </div>
              )}
              
              {chatHistory.map((msg, i) => (
                <div key={i} className={cn(
                  "flex flex-col max-w-[85%]",
                  msg.role === 'user' ? "ml-auto items-end" : "items-start"
                )}>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-emerald-600 text-white rounded-tr-none" 
                      : "bg-zinc-100 text-zinc-800 rounded-tl-none markdown-body"
                  )}>
                    {msg.role === 'ai' ? (
                      <Markdown>{msg.content}</Markdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 uppercase font-medium tracking-tighter">
                    {msg.role === 'user' ? 'You' : 'Coach'}
                  </span>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-start gap-2">
                  <div className="bg-zinc-100 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-emerald-600" />
                    <span className="text-xs font-medium text-zinc-500">분석 중...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-zinc-50 border-t border-zinc-100">
              <div className="relative">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="코치에게 질문하기..."
                  className="w-full bg-white border border-zinc-200 rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!chatInput.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-10 py-12 border-t border-zinc-200 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Trophy size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Golf Swing Pro v1.0</span>
          </div>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <a href="#" className="hover:text-zinc-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
