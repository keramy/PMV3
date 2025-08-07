/**
 * Weather API Route
 * Returns weather data for construction planning
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    
    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude required' },
        { status: 400 }
      )
    }

    // Mock weather data - In production, integrate with actual weather service
    const weatherData = {
      current: {
        temperature: 72,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 8,
        windDirection: 'SW',
        visibility: 10,
        precipitation: 0
      },
      
      // 5-day forecast
      forecast: [
        {
          date: new Date().toISOString().split('T')[0],
          high: 78,
          low: 65,
          condition: 'Partly Cloudy',
          precipitation: 10,
          windSpeed: 12,
          workability: 'good'
        },
        {
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          high: 75,
          low: 62,
          condition: 'Sunny',
          precipitation: 0,
          windSpeed: 8,
          workability: 'excellent'
        },
        {
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          high: 73,
          low: 58,
          condition: 'Light Rain',
          precipitation: 60,
          windSpeed: 15,
          workability: 'limited'
        },
        {
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          high: 70,
          low: 55,
          condition: 'Heavy Rain',
          precipitation: 85,
          windSpeed: 25,
          workability: 'poor'
        },
        {
          date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          high: 76,
          low: 60,
          condition: 'Cloudy',
          precipitation: 20,
          windSpeed: 10,
          workability: 'good'
        }
      ],

      // Construction-specific alerts
      alerts: [
        {
          type: 'wind_warning',
          severity: 'moderate',
          title: 'High Wind Advisory',
          description: 'Winds up to 25 mph expected Thursday. Secure loose materials.',
          startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 3.5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],

      // Work recommendations
      workRecommendations: {
        concretePouring: 'favorable',
        roofingWork: 'caution',
        electricalWork: 'favorable',
        paintingWork: 'favorable',
        earthwork: 'limited'
      }
    }

    // Simulate network delay for development
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 800))
    }

    return NextResponse.json(weatherData)
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}