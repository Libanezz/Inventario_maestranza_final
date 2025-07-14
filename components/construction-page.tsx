import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Construction } from "lucide-react"

interface ConstructionPageProps {
  title: string
  description: string
}

export function ConstructionPage({ title, description }: ConstructionPageProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Construction className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Esta funcionalidad estará disponible próximamente.</p>
        </CardContent>
      </Card>
    </div>
  )
}
