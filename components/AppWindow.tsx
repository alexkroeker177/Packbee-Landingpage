import React from 'react';
import { 
  Menu, MousePointer2, StickyNote, Type, Image as ImageIcon, 
  Link2, PenTool, Layout, Smile, Search, Share2, Play, MessageSquare, Lock,
  MoreHorizontal, ChevronDown, Monitor
} from 'lucide-react';

export const AppWindow: React.FC = () => {
  return (
    <div className="w-full bg-white rounded-xl shadow-2xl border border-gray-200/50 overflow-hidden flex flex-col aspect-[16/9] min-h-[600px]">
      {/* App Header */}
      <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-white shrink-0">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-500">
                <MoreHorizontal size={20} />
            </div>
            <div className="flex items-center gap-2">
                <div className="bg-purple-100 text-purple-600 p-1 rounded">
                    <Monitor size={16} />
                </div>
                <span className="font-semibold text-gray-800 text-sm">Desktop app planning</span>
                <ChevronDown size={14} className="text-gray-400" />
                <span className="text-gray-300">★</span>
            </div>
        </div>

        <div className="flex items-center gap-3">
             <div className="flex items-center text-gray-500 text-sm gap-1 mr-2">
                <MousePointer2 size={14} className="transform rotate-12" />
                <span>5</span>
             </div>
             <div className="flex -space-x-2">
                <img src="https://picsum.photos/32/32?random=1" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
                <img src="https://picsum.photos/32/32?random=2" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
                <img src="https://picsum.photos/32/32?random=3" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
                <div className="w-8 h-8 rounded-full border-2 border-white bg-purple-100 text-purple-600 text-xs flex items-center justify-center font-bold">+4</div>
             </div>
             <div className="h-6 w-px bg-gray-200 mx-1"></div>
             <button className="p-2 hover:bg-gray-100 rounded text-gray-600"><Play size={18} /></button>
             <button className="p-2 hover:bg-gray-100 rounded text-gray-600"><MessageSquare size={18} /></button>
             <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1.5">
                <Lock size={12} />
                Share
             </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Tools */}
        <div className="w-14 bg-[#232B36] flex flex-col items-center py-4 gap-4 shrink-0 z-10">
            <ToolButton icon={<MessageSquare size={20} />} active={false} />
            <ToolButton icon={<StickyNote size={20} color="#D68BF5" fill="#D68BF5" />} active={true} />
            <ToolButton icon={<Layout size={20} />} active={false} />
            <ToolButton icon={<ImageIcon size={20} />} active={false} />
            <ToolButton icon={<Link2 size={20} />} active={false} />
            <div className="h-px w-8 bg-gray-700 my-1"></div>
            <ToolButton icon={<Type size={20} />} active={false} />
            <ToolButton icon={<PenTool size={20} />} active={false} />
            <ToolButton icon={<Layout size={20} />} active={false} />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-[#F7F8FA] relative overflow-hidden mock-scrollbar cursor-grab active:cursor-grabbing p-10">
            
            {/* Background Dot Pattern */}
            <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#CBD5E0 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            {/* Content Container - Scaled to fit nicely */}
            <div className="absolute top-10 left-10 w-[1200px] h-[800px] origin-top-left transform scale-[0.85] lg:scale-100">
                
                {/* --- Sticky Notes Cluster --- */}
                <div className="absolute top-20 left-20 flex flex-col gap-4">
                    <div className="flex gap-4 items-start">
                        <StickyNoteCard 
                            color="bg-yellow-200" 
                            text={`Binaries
• Mac (Intel, M*)
• Windows
• Linux?`}
                            author="Sam"
                            className="transform -rotate-1"
                        />
                        <StickyNoteCard 
                            color="bg-yellow-200" 
                            text="We need to build a public-facing page on .com for users to download the app" 
                            author="Sam"
                            className="translate-y-12"
                        />
                    </div>
                    <div className="relative">
                        <StickyNoteCard 
                             color="bg-yellow-200" 
                             text="Tabs are a significant advantage over the PWA, aside from a more obvious installation process" 
                             author="Sam"
                             className="ml-24 transform rotate-1"
                        />
                    </div>
                </div>

                {/* --- Mind Map Section --- */}
                <div className="absolute top-40 right-40 w-[500px]">
                    {/* SVG Connector Lines */}
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible">
                        <path d="M 140 100 C 200 100, 200 60, 260 60" fill="none" stroke="#A855F7" strokeWidth="2" />
                        <path d="M 140 100 C 200 100, 200 160, 260 160" fill="none" stroke="#3B82F6" strokeWidth="2" />
                        <path d="M 140 100 L 260 100" fill="none" stroke="#F97316" strokeWidth="2" />
                        
                        {/* Sub branches top */}
                        <path d="M 360 60 C 380 60, 380 40, 400 40" fill="none" stroke="#A855F7" strokeWidth="1.5" />
                        <path d="M 360 60 C 380 60, 380 80, 400 80" fill="none" stroke="#A855F7" strokeWidth="1.5" />

                        {/* Sub branches bottom */}
                        <path d="M 340 160 C 360 160, 360 140, 380 140" fill="none" stroke="#3B82F6" strokeWidth="1.5" />
                        <path d="M 340 160 C 360 160, 360 180, 380 180" fill="none" stroke="#3B82F6" strokeWidth="1.5" />
                        <path d="M 340 160 C 360 160, 360 200, 380 200" fill="none" stroke="#3B82F6" strokeWidth="1.5" />
                        
                        {/* Sub branches mid */}
                        <path d="M 370 100 C 390 100, 390 85, 410 85" fill="none" stroke="#F97316" strokeWidth="1.5" />
                        <path d="M 370 100 C 390 100, 390 115, 410 115" fill="none" stroke="#F97316" strokeWidth="1.5" />

                    </svg>

                    <div className="absolute top-[85px] left-0 bg-white border border-gray-200 shadow-sm px-4 py-2 rounded text-sm text-gray-700 whitespace-nowrap z-10">
                        Desktop App Focus Areas
                    </div>

                    {/* Nodes */}
                    <div className="absolute top-[45px] left-[260px] text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded shadow-sm border border-purple-100">UI Design</div>
                    <div className="absolute top-[145px] left-[260px] text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded shadow-sm border border-blue-100">System</div>
                    <div className="absolute top-[88px] left-[260px] text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded shadow-sm border border-orange-100">Performance</div>

                    {/* Leaf Nodes */}
                    <div className="absolute top-[30px] left-[400px] text-[10px] text-gray-500">Layout and navigation</div>
                    <div className="absolute top-[70px] left-[400px] text-[10px] text-gray-500">macOS native styling</div>
                    
                    <div className="absolute top-[130px] left-[385px] text-[10px] text-gray-500 flex items-center gap-1">Notifications <span className="bg-blue-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-[8px]">2</span></div>
                    <div className="absolute top-[170px] left-[385px] text-[10px] text-gray-500">Shortcuts & Hotkeys</div>
                    <div className="absolute top-[195px] left-[385px] text-[10px] text-gray-500">Menu access</div>

                    <div className="absolute top-[78px] left-[415px] text-[10px] text-gray-500">Loading</div>
                    <div className="absolute top-[108px] left-[415px] text-[10px] text-gray-500">Startup</div>
                </div>


                {/* --- Kanban / Cards Bottom --- */}
                <div className="absolute top-[450px] left-0 flex gap-8 w-full">
                    
                    {/* Column 1 */}
                    <div className="w-[300px]">
                        <h3 className="text-lg font-bold text-gray-700 mb-2">Up Next</h3>
                        <div className="bg-[#007ACD] rounded-lg p-3 text-white shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-2 mb-2 text-xs opacity-90 font-medium">
                                <span className="bg-white/20 px-1.5 py-0.5 rounded">#2405</span>
                                <span>🔊 Up Next</span>
                                <div className="ml-auto"><img src="https://picsum.photos/20/20?random=4" className="w-5 h-5 rounded-full" /></div>
                            </div>
                            <p className="font-semibold text-sm leading-snug mb-3">"New Window" command for MacOS File menu</p>
                            <div className="flex gap-2 text-xs font-medium">
                                <span className="bg-white/20 px-2 py-0.5 rounded flex items-center gap-1">🐞 Bug</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded flex items-center gap-1">🔥 P1</span>
                            </div>
                        </div>
                    </div>

                    {/* Column 2 */}
                    <div className="w-[300px]">
                        <h3 className="text-lg font-bold text-gray-700 mb-2">In progress</h3>
                        <div className="bg-[#F97316] rounded-lg p-3 text-white shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-2 mb-2 text-xs opacity-90 font-medium">
                                <span className="bg-white/20 px-1.5 py-0.5 rounded">#2325</span>
                                <span>🌖 In Progress</span>
                                <div className="ml-auto"><img src="https://picsum.photos/20/20?random=5" className="w-5 h-5 rounded-full" /></div>
                            </div>
                            <p className="font-semibold text-sm leading-snug mb-3">New Modal: Announce desktop app to select audiences</p>
                            <div className="flex gap-2 text-xs font-medium">
                                <span className="bg-white/20 px-2 py-0.5 rounded flex items-center gap-1">🎨 Polish</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded flex items-center gap-1">🔥 P1</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const ToolButton = ({ icon, active }: { icon: React.ReactNode, active: boolean }) => (
    <button className={`p-2 rounded hover:bg-white/10 transition-colors ${active ? 'bg-white/20 text-white' : 'text-gray-400'}`}>
        {icon}
    </button>
);

const StickyNoteCard = ({ color, text, author, className = "" }: { color: string, text: string, author: string, className?: string }) => (
    <div className={`w-48 aspect-square ${color} shadow-md p-4 flex flex-col justify-between font-medium text-sm text-gray-800 relative group hover:-translate-y-1 transition-transform ${className}`}>
        <p className="whitespace-pre-line leading-relaxed">{text}</p>
        <div className="flex items-center gap-2 mt-2">
            <img src={`https://ui-avatars.com/api/?name=${author}&background=random`} className="w-5 h-5 rounded-full" alt={author} />
            <span className="text-xs text-gray-600">{author}</span>
        </div>
    </div>
);