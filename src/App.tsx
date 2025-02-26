import { twMerge } from 'tailwind-merge'
import './App.css'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import clsx from 'clsx'
import { useState } from 'react'


function App() {
  const [port, setPort] = useState<number>(3000)
  const [html, setHtml] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')





  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // Chrome Extension API를 통한 메시지 전송
      const response = await chrome.runtime.sendMessage({
        type: 'FETCH_HTML',
        port: port
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      setHtml(response.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('서버에 접속할 수 없습니다. 포트 번호를 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-[400px] p-4">
      <form 
        onSubmit={handleSubmit}
        className={twMerge(clsx([
          'flex', 'flex-col', 'gap-4', 'p-4', 'bg-white', 'shadow-md', 'rounded-lg'
        ]))}>
        <Input 
          placeholder='포트 번호' 
          type="number"
          value={port} 
          onChange={(e) => setPort(Number(e.target.value))}
        />  
        <Button disabled={loading}>
          {loading ? '검사 중...' : '검사'}
        </Button>
      </form>    
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div> 
      )}

      {html && html}
      
   

      {/* {html && html.map((line, index) => (
        <div key={index} className="mt-2 p-2 bg-gray-100 rounded text-sm">
          {line}
        </div>
      ))} */}
    </div>
  )
}

export default App
