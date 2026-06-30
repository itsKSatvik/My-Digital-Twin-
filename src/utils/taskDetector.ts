import { TaskCategory } from '../types';

interface DetectionResult {
  category: TaskCategory;
  confidence: 'high' | 'low';
}

export function detectTaskCategory(title: string): DetectionResult {
  const t = title.toLowerCase().trim();
  if (!t) return { category: 'Assignment', confidence: 'low' };

  // Study
  if (
    t.includes('study') ||
    t.includes('exam') ||
    t.includes('prep') ||
    t.includes('midterm') ||
    t.includes('test') ||
    t.includes('quiz') ||
    t.includes('textbook') ||
    t.includes('dsa') ||
    t.includes('learn') ||
    t.includes('lecture') ||
    t.includes('revision') ||
    t.includes('course') ||
    t.includes('subject')
  ) {
    return { category: 'Study', confidence: 'high' };
  }

  // Bill Payment
  if (
    t.includes('pay') ||
    t.includes('bill') ||
    t.includes('rent') ||
    t.includes('invoice') ||
    t.includes('electricity') ||
    t.includes('gas') ||
    t.includes('internet') ||
    t.includes('water') ||
    t.includes('subscription') ||
    t.includes('credit card') ||
    t.includes('utility') ||
    t.includes('premium') ||
    t.includes('fee') ||
    t.includes('dues')
  ) {
    return { category: 'Bill Payment', confidence: 'high' };
  }

  // Shopping
  if (
    t.includes('buy') ||
    t.includes('shop') ||
    t.includes('vegetable') ||
    t.includes('grocery') ||
    t.includes('groceries') ||
    t.includes('supermarket') ||
    t.includes('purchase') ||
    t.includes('order') ||
    t.includes('store') ||
    t.includes('cart')
  ) {
    return { category: 'Shopping', confidence: 'high' };
  }

  // Meeting
  if (
    t.includes('meeting') ||
    t.includes('appointment') ||
    t.includes('sync') ||
    t.includes('call') ||
    t.includes('doctor') ||
    t.includes('dentist') ||
    t.includes('interview') ||
    t.includes('discussion') ||
    t.includes('standup') ||
    t.includes('presentation') ||
    t.includes('review')
  ) {
    return { category: 'Meeting', confidence: 'high' };
  }

  // Health & Fitness
  if (
    t.includes('run') ||
    t.includes('workout') ||
    t.includes('gym') ||
    t.includes('exercise') ||
    t.includes('jog') ||
    t.includes('cycle') ||
    t.includes('cycling') ||
    t.includes('yoga') ||
    t.includes('swim') ||
    t.includes('cardio') ||
    t.includes('fitness') ||
    t.includes('train') ||
    t.includes('stretching') ||
    t.includes('meditat')
  ) {
    return { category: 'Health & Fitness', confidence: 'high' };
  }

  // Travel
  if (
    t.includes('travel') ||
    t.includes('trip') ||
    t.includes('flight') ||
    t.includes('ticket') ||
    t.includes('hotel') ||
    t.includes('booking') ||
    t.includes('pack') ||
    t.includes('luggage') ||
    t.includes('vacation') ||
    t.includes('airport') ||
    t.includes('tour')
  ) {
    return { category: 'Travel', confidence: 'high' };
  }

  // Household
  if (
    t.includes('clean') ||
    t.includes('kitchen') ||
    t.includes('laundry') ||
    t.includes('dish') ||
    t.includes('dishes') ||
    t.includes('vacuum') ||
    t.includes('wash') ||
    t.includes('repair') ||
    t.includes('garden') ||
    t.includes('house') ||
    t.includes('trash')
  ) {
    return { category: 'Household', confidence: 'high' };
  }

  // Habit
  if (
    t.includes('daily') ||
    t.includes('morning') ||
    t.includes('evening') ||
    t.includes('routine') ||
    t.includes('every day') ||
    t.includes('habit') ||
    t.includes('wake up') ||
    t.includes('stretch') ||
    t.includes('water')
  ) {
    return { category: 'Habit', confidence: 'high' };
  }

  // Personal Goal
  if (
    t.includes('goal') ||
    t.includes('target') ||
    t.includes('achieve') ||
    t.includes('complete') ||
    t.includes('finish') ||
    t.includes('master') ||
    t.includes('read') ||
    t.includes('practice')
  ) {
    return { category: 'Personal Goal', confidence: 'high' };
  }

  // Assignment
  if (
    t.includes('assignment') ||
    t.includes('project') ||
    t.includes('lab') ||
    t.includes('report') ||
    t.includes('essay') ||
    t.includes('thesis') ||
    t.includes('github') ||
    t.includes('code') ||
    t.includes('compile') ||
    t.includes('submission')
  ) {
    return { category: 'Assignment', confidence: 'high' };
  }

  // Work
  if (
    t.includes('work') ||
    t.includes('office') ||
    t.includes('client') ||
    t.includes('job') ||
    t.includes('sprint') ||
    t.includes('manager') ||
    t.includes('deck') ||
    t.includes('excel') ||
    t.includes('email') ||
    t.includes('resume')
  ) {
    return { category: 'Work', confidence: 'high' };
  }

  // Fallback to Assignment with low confidence
  return { category: 'Assignment', confidence: 'low' };
}
