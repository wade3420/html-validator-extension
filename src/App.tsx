import { twMerge } from 'tailwind-merge'
import './App.css'
import { Button } from './components/ui/button'
import clsx from 'clsx'
import { useState, useMemo } from 'react'

interface ValidationError {
  type: 'error' | 'warning' | 'info';
  message: string;
}



function App() {
  const [html, setHtml] = useState<ValidationError[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  // 통계 계산을 위한 useMemo
  const stats = useMemo(() => {
    const initial: Record<ValidationError['type'] | 'total', number> = {
      total: 0,
      error: 0,
      warning: 0,
      info: 0
    };
    
    return html.reduce((acc, curr) => {
      acc.total++;
      acc[curr.type]++;
      return acc;
    }, initial);
  }, [html]);

  // stats useMemo 아래에 sortedHtml useMemo 추가
  const sortedHtml = useMemo(() => {
    const typeOrder = { error: 0, warning: 1, info: 2 };
    return [...html].sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);
  }, [html]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0]
      if (!tab) {
        setError('활성화된 탭이 없습니다.')
        return
      }


    try {
      // Chrome Extension API를 통한 메시지 전송
      const response = await chrome.runtime.sendMessage({
        type: 'FETCH_HTML',
        url: tab.url,
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      setHtml(response.validation?.messages || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('서버에 접속할 수 없습니다. 포트 번호를 확인해주세요.')
    } finally {
      setLoading(false)
    }
  })
  }



  return (
    <div className="p-3 h-full w-full overflow-y-auto">
      <div className="bg-white/80 backdrop-blur-sm pb-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 border rounded-lg bg-white">
            <h3 className="text-sm font-bold">전체</h3>
            <p className="text-xl">{stats.total}</p>
          </div>
          <div className="p-3 border rounded-lg bg-red-50">
            <h3 className="text-sm font-bold text-red-700">오류</h3>
            <p className="text-xl text-red-700">{stats.error}</p>
          </div>
          <div className="p-3 border rounded-lg bg-yellow-50">
            <h3 className="text-sm font-bold text-yellow-700">경고</h3>
            <p className="text-xl text-yellow-700">{stats.warning}</p>
          </div>
          <div className="p-3 border rounded-lg bg-blue-50">
            <h3 className="text-sm font-bold text-blue-700">정보</h3>
            <p className="text-xl text-blue-700">{stats.info}</p>
          </div>
        </div>
      </div>
     

      <form 
        onSubmit={handleSubmit}
        className={twMerge(clsx([
          'flex', 'flex-col', 'gap-3', 'p-3', 'bg-white', 'shadow-sm', 'rounded-lg', 'mb-4'
        ]))}>
        <Button disabled={loading}>
          {loading ? '검사 중...' : '검사'}
        </Button>
      </form>    
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div> 
      )}

      {/* 유효성 검사 결과 목록 */}
      <div className="space-y-2 overflow-y-auto flex-1">
        {sortedHtml.map((error, index) => (
          <div 
            key={index}
            className={`p-3 border rounded-lg ${
              error.type === 'error' ? 'bg-red-50 border-red-200' :
              error.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
              'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className={`font-semibold text-sm ${
                error.type === 'error' ? 'text-red-700' :
                error.type === 'warning' ? 'text-yellow-700' :
                'text-blue-700'
              }`}>
                {error.type}
              </span>
              <span className="text-sm">{error.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
