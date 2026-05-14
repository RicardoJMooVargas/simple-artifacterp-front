import { Construction } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

function UnderConstructionCard({ title }) {
  return (
    <Card className="status-card">
      <CardHeader>
        <div className="status-icon">
          <Construction size={26} />
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="status-text">En construccion</p>
      </CardContent>
    </Card>
  )
}

export default UnderConstructionCard
