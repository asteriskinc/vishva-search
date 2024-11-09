'use client';

import React from 'react';
import { Card, CardBody, CardHeader, Chip, Avatar, Button } from "@nextui-org/react";
import { LucideIcon, CheckCircle2, ArrowRight, MonitorPlay, Ticket, MapPin, Clock, Building2, Map } from 'lucide-react';

interface AgentCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  status: 'waiting' | 'processing' | 'completed' | 'error';
  message?: string;
  type: 'intent' | 'availability' | 'theaters' | 'directions';
}

export default function AgentCard({ 
  title, 
  description, 
  icon: Icon, 
  status, 
  message,
  type 
}: AgentCardProps) {
  const statusStyles = {
    waiting: { color: 'default', animation: '' },
    processing: { color: 'primary', animation: 'animate-pulse' },
    completed: { color: 'success', animation: '' },
    error: { color: 'danger', animation: '' },
  };

  const renderIntentContent = () => (
    <div className="mt-4 space-y-3">
      <h6 className="text-sm font-medium">Identified Tasks:</h6>
      <div className="space-y-2">
        {[
          'Determine movie availability (Smile 2)',
          'Check local theater schedules',
          'Find nearest theater locations',
          'Calculate travel routes'
        ].map((task, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>{task}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAvailabilityContent = () => (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-4">
        <Card className="border-2 border-success flex-1">
          <CardBody className="py-3 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-success" />
            <span className="text-sm font-medium">Available in Theaters</span>
          </CardBody>
        </Card>
        <ArrowRight className="w-5 h-5" />
        <Card className="border-2 border-default flex-1">
          <CardBody className="py-3 flex items-center gap-2">
            <MonitorPlay className="w-4 h-4 text-default-500" />
            <span className="text-sm font-medium">Not yet streaming</span>
          </CardBody>
        </Card>
      </div>
      <p className="text-sm text-default-500">
        Currently showing exclusively in theaters. Expected streaming release: March 2024
      </p>
    </div>
  );

  const renderTheatersContent = () => (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {[
          {
            name: 'AMC Universal CityWalk',
            distance: '2.5 miles',
            showTimes: ['7:30 PM', '9:45 PM', '10:30 PM'],
            seats: 'Multiple seats available'
          },
          {
            name: 'Regal LA Live',
            distance: '3.8 miles',
            showTimes: ['7:00 PM', '8:15 PM', '10:00 PM'],
            seats: 'Limited seats available'
          }
        ].map((theater, index) => (
          <Card key={index} className="bg-content1/50">
            <CardBody className="py-2">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h6 className="font-medium">{theater.name}</h6>
                  <div className="flex items-center gap-1 text-tiny text-default-500">
                    <MapPin className="w-3 h-3" />
                    <span>{theater.distance}</span>
                  </div>
                </div>
                <Chip size="sm" variant="flat" color="warning">
                  {theater.seats}
                </Chip>
              </div>
              <div className="flex gap-2 mt-2">
                {theater.showTimes.map((time, idx) => (
                  <Chip 
                    key={idx} 
                    size="sm" 
                    variant="flat" 
                    className="cursor-pointer hover:bg-primary/20"
                  >
                    {time}
                  </Chip>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderDirectionsContent = () => (
    <div className="mt-4 space-y-3">
      <Card className="bg-content1/50">
        <CardBody className="py-2">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-success" />
              <div className="w-0.5 h-10 bg-default-200" />
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
            <div className="flex flex-col gap-8">
              <div>
                <p className="text-tiny text-default-500">From</p>
                <p className="text-sm font-medium">Deus Ex Machina, Venice</p>
              </div>
              <div>
                <p className="text-tiny text-default-500">To</p>
                <p className="text-sm font-medium">AMC Universal CityWalk</p>
              </div>
            </div>
            <div className="ml-auto flex flex-col items-end gap-1">
              <Chip size="sm" color="success" variant="flat">Fastest Route</Chip>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>25 mins</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Map className="w-4 h-4" />
                <span>8.3 miles</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
      <Button 
        size="sm" 
        color="primary" 
        variant="ghost" 
        className="w-full"
      >
        View in Google Maps
      </Button>
    </div>
  );

  const renderSpecificContent = () => {
    switch (type) {
      case 'intent':
        return renderIntentContent();
      case 'availability':
        return renderAvailabilityContent();
      case 'theaters':
        return renderTheatersContent();
      case 'directions':
        return renderDirectionsContent();
      default:
        return null;
    }
  };

  return (
    <Card 
      className="w-full transition-all duration-500 ease-in-out"
      shadow="sm"
    >
      <CardHeader className="flex gap-3">
        <div className={`p-2 rounded-full ${
          status === 'completed' ? 'bg-success/10 text-success' : 
          status === 'processing' ? 'bg-primary/10 text-primary' : 
          'bg-default/10 text-default-500'
        }`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-small text-default-500">{description}</p>
        </div>
        <Chip
          color={statusStyles[status].color as any}
          variant="flat"
          className="ml-auto"
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Chip>
      </CardHeader>
      <CardBody>
        {message && (
          <p className="text-default-500 mb-4">{message}</p>
        )}
        {renderSpecificContent()}
      </CardBody>
    </Card>
  );
}