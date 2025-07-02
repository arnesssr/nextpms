'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkTables = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/tables');
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error checking tables:', error);
      setResults({ error: 'Failed to check tables' });
    } finally {
      setLoading(false);
    }
  };

  const populateInventory = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/inventory/populate', {
        method: 'POST',
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error populating inventory:', error);
      setResults({ error: 'Failed to populate inventory' });
    } finally {
      setLoading(false);
    }
  };

  const populateInventorySimple = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/inventory/populate-simple', {
        method: 'POST',
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error populating inventory (simple):', error);
      setResults({ error: 'Failed to populate inventory (simple)' });
    } finally {
      setLoading(false);
    }
  };

  const testInventoryAPI = async () => {
    setLoading(true);
    try {
      console.log('Testing inventory API...');
      const response = await fetch('/api/inventory');
      const data = await response.json();
      console.log('Inventory API response:', data);
      setResults(data);
    } catch (error) {
      console.error('Error testing inventory API:', error);
      setResults({ error: 'Failed to test inventory API' });
    } finally {
      setLoading(false);
    }
  };

  const testDirectSQL = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/sql-test', {
        method: 'POST',
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error testing direct SQL:', error);
      setResults({ error: 'Failed to test direct SQL' });
    } finally {
      setLoading(false);
    }
  };

  const testMovementsAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/movements');
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error testing movements API:', error);
      setResults({ error: 'Failed to test movements API' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Debug Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Database Tables</CardTitle>
            <CardDescription>Check if required tables exist</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={checkTables} disabled={loading}>
              Check Tables
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Populate Inventory</CardTitle>
            <CardDescription>Create inventory items from existing products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button onClick={populateInventory} disabled={loading}>
                Populate Inventory
              </Button>
              <Button onClick={populateInventorySimple} disabled={loading} variant="outline">
                Simple Populate
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Inventory API</CardTitle>
            <CardDescription>Test the inventory API endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testInventoryAPI} disabled={loading}>
              Test Inventory API
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Movements API</CardTitle>
            <CardDescription>Test the movements API endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testMovementsAPI} disabled={loading}>
              Test Movements API
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Direct SQL Test</CardTitle>
            <CardDescription>Test database operations directly</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testDirectSQL} disabled={loading} variant="destructive">
              Run SQL Tests
            </Button>
          </CardContent>
        </Card>
      </div>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
