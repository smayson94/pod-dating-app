'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Pod, Profile } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function Pods() {
  const { user } = useAuth();
  const [pods, setPods] = useState<(Pod & { members: Profile[] })[]>([]);
  const [newPodName, setNewPodName] = useState('');
  const [newPodDescription, setNewPodDescription] = useState('');
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchPods();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchPods = async () => {
    try {
      const { data: podsData, error: podsError } = await supabase
        .from('pods')
        .select(`
          *,
          members:pod_members(
            profile:profiles(*)
          )
        `);

      if (podsError) throw podsError;

      const formattedPods = podsData.map((pod: any) => ({
        ...pod,
        members: pod.members.map((m: any) => m.profile),
      }));

      setPods(formattedPods);
    } catch (error) {
      console.error('Error fetching pods:', error);
      toast.error('Failed to load pods');
    }
  };

  const createPod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userProfile) {
      toast.error('Please sign in and create a profile first');
      return;
    }

    try {
      // Create the pod
      const { data: podData, error: podError } = await supabase
        .from('pods')
        .insert({
          name: newPodName,
          description: newPodDescription,
        })
        .select()
        .single();

      if (podError) throw podError;

      // Add the creator as a member
      const { error: memberError } = await supabase
        .from('pod_members')
        .insert({
          pod_id: podData.id,
          profile_id: userProfile.id,
        });

      if (memberError) throw memberError;

      toast.success('Pod created successfully!');
      setNewPodName('');
      setNewPodDescription('');
      fetchPods();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const joinPod = async (podId: string) => {
    if (!user || !userProfile) {
      toast.error('Please sign in and create a profile first');
      return;
    }

    try {
      const { error } = await supabase
        .from('pod_members')
        .insert({
          pod_id: podId,
          profile_id: userProfile.id,
        });

      if (error) throw error;

      toast.success('Joined pod successfully!');
      fetchPods();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const isUserInPod = (pod: Pod & { members: Profile[] }) => {
    return pod.members.some(member => member.id === userProfile?.id);
  };

  if (!user) {
    return (
      <div className="text-center mt-8">
        <p className="text-xl text-gray-600">Please sign in to view and join pods.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Create Pod Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create a New Pod</h2>
          <form onSubmit={createPod} className="space-y-4">
            <div>
              <label htmlFor="podName" className="block text-sm font-medium text-gray-700">
                Pod Name
              </label>
              <input
                type="text"
                id="podName"
                value={newPodName}
                onChange={(e) => setNewPodName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label htmlFor="podDescription" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="podDescription"
                value={newPodDescription}
                onChange={(e) => setNewPodDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Create Pod
            </button>
          </form>
        </div>

        {/* Pods List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Pods</h2>
          <div className="space-y-4">
            {pods.map((pod) => (
              <div key={pod.id} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-900">{pod.name}</h3>
                <p className="text-gray-600 mt-2">{pod.description}</p>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    {pod.members.length} member{pod.members.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {!isUserInPod(pod) && (
                  <button
                    onClick={() => joinPod(pod.id)}
                    className="mt-4 w-full bg-purple-100 text-purple-700 px-4 py-2 rounded-md hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    Join Pod
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 