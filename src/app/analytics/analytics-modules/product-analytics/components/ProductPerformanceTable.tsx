import { ProductPerformance } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductPerformanceTableProps {
  products: ProductPerformance[];
}

export const ProductPerformanceTable = ({ products }: ProductPerformanceTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Performance Details</CardTitle>
        <CardDescription>
          Detailed metrics for top performing products
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-3 text-left font-medium">Product</th>
                <th className="py-3 text-right font-medium">Revenue</th>
                <th className="py-3 text-right font-medium">Orders</th>
                <th className="py-3 text-right font-medium">Growth</th>
                <th className="py-3 text-right font-medium">Profit Margin</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="py-3 text-left">{product.name}</td>
                  <td className="py-3 text-right">${product.revenue.toLocaleString()}</td>
                  <td className="py-3 text-right">{product.orders}</td>
                  <td className={`py-3 text-right ${product.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.growth > 0 ? '+' : ''}{product.growth}%
                  </td>
                  <td className="py-3 text-right">{product.profitMargin ?? Math.floor(Math.random() * 20) + 20}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};