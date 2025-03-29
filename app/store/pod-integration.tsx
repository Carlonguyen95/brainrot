"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"

export default function PrintOnDemandIntegration() {
  const [activeTab, setActiveTab] = useState("printful")
  const [showSuccess, setShowSuccess] = useState(false)

  const handleConnect = () => {
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Print-on-Demand Integration</CardTitle>
        <CardDescription>
          Connect your store to a print-on-demand service to automatically fulfill orders
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showSuccess && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Successfully connected! Your products will now be automatically fulfilled.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="printful" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="printful">Printful</TabsTrigger>
            <TabsTrigger value="printify">Printify</TabsTrigger>
          </TabsList>

          <TabsContent value="printful" className="space-y-4">
            <div className="py-4">
              <h3 className="font-medium mb-2">Printful Integration</h3>
              <p className="text-sm text-gray-500 mb-4">
                Printful offers high-quality print-on-demand products with seamless integration.
              </p>

              <ul className="list-disc list-inside text-sm text-gray-500 space-y-1 mb-4">
                <li>70+ customizable products</li>
                <li>Warehouses in USA, Europe, and Asia</li>
                <li>Automatic order fulfillment</li>
                <li>White-label shipping</li>
              </ul>

              <Button onClick={handleConnect} className="w-full">
                Connect to Printful
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="printify" className="space-y-4">
            <div className="py-4">
              <h3 className="font-medium mb-2">Printify Integration</h3>
              <p className="text-sm text-gray-500 mb-4">
                Printify connects you to a global network of print providers for maximum flexibility.
              </p>

              <ul className="list-disc list-inside text-sm text-gray-500 space-y-1 mb-4">
                <li>800+ customizable products</li>
                <li>Multiple print providers to choose from</li>
                <li>Competitive pricing options</li>
                <li>Global shipping network</li>
              </ul>

              <Button onClick={handleConnect} className="w-full">
                Connect to Printify
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 border-t pt-4">
          <h3 className="font-medium mb-2">How It Works</h3>
          <ol className="list-decimal list-inside text-sm text-gray-500 space-y-2">
            <li>Connect your Brain Rot Dictionary store to {activeTab === "printful" ? "Printful" : "Printify"}</li>
            <li>Set up product templates for your slang terms</li>
            <li>
              When a customer orders, the order is automatically sent to{" "}
              {activeTab === "printful" ? "Printful" : "Printify"}
            </li>
            <li>They print and ship the product directly to your customer</li>
            <li>You keep the profit margin between your selling price and the POD cost</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}

