import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils - cn function', () => {
  it('should combine single class', () => {
    expect(cn('px-2')).toBe('px-2');
  });

  it('should combine multiple classes', () => {
    const result = cn('px-2', 'py-1');
    expect(result).toContain('px-2');
    expect(result).toContain('py-1');
  });

  it('should merge tailwind classes correctly', () => {
    const result = cn('px-2 py-1', 'px-4');
    expect(result).toContain('py-1');
    expect(result).toContain('px-4');
    expect(result).not.toContain('px-2 px-4');
  });

  it('should handle conditional classes', () => {
    const condition = true;
    const result = cn(condition && 'px-2', 'py-1');
    expect(result).toContain('px-2');
  });

  it('should ignore falsy conditional classes', () => {
    const condition = false;
    const result = cn(condition && 'px-2', 'py-1');
    expect(result).not.toContain('px-2');
    expect(result).toContain('py-1');
  });

  it('should handle null and undefined values', () => {
    const result = cn(null, undefined, 'px-2');
    expect(result).toBe('px-2');
  });

  it('should combine conflicting bg colors correctly', () => {
    const result = cn('bg-red-500', 'bg-blue-500');
    expect(result).toContain('bg-blue-500');
    expect(result).not.toContain('bg-red-500');
  });

  it('should combine conflicting text colors correctly', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toContain('text-blue-500');
    expect(result).not.toContain('text-red-500');
  });

  it('should handle empty string', () => {
    const result = cn('', 'px-2');
    expect(result).toBe('px-2');
  });

  it('should handle array of classes', () => {
    const classes = ['px-2', 'py-1'];
    const result = cn(...classes);
    expect(result).toContain('px-2');
    expect(result).toContain('py-1');
  });

  it('should handle object with boolean values', () => {
    const result = cn({
      'px-2': true,
      'py-1': false,
    });
    expect(result).toContain('px-2');
    expect(result).not.toContain('py-1');
  });

  it('should respect last override in order', () => {
    const result = cn('w-full', 'w-1/2');
    expect(result).toContain('w-1/2');
  });

  it('should handle display classes correctly', () => {
    const result = cn('block', 'flex');
    expect(result).toContain('flex');
  });

  it('should preserve non-conflicting utilities', () => {
    const result = cn('px-2 bg-red-500', 'py-1');
    expect(result).toContain('px-2');
    expect(result).toContain('bg-red-500');
    expect(result).toContain('py-1');
  });

  it('should handle complex class combinations', () => {
    const result = cn(
      'flex items-center justify-between',
      'px-4 py-2',
      'bg-white',
      'border border-gray-200',
      'rounded-lg'
    );
    expect(result).toContain('flex');
    expect(result).toContain('items-center');
    expect(result).toContain('justify-between');
    expect(result).toContain('px-4');
    expect(result).toContain('bg-white');
    expect(result).toContain('border');
    expect(result).toContain('rounded-lg');
  });

  it('should not duplicate classes', () => {
    const result = cn('px-2', 'px-2');
    expect(result).toBe('px-2');
  });

  it('should handle hover and active states', () => {
    const result = cn('hover:bg-red-500', 'active:text-white');
    expect(result).toContain('hover:bg-red-500');
    expect(result).toContain('active:text-white');
  });

  it('should handle responsive classes', () => {
    const result = cn('md:px-4', 'lg:px-6');
    expect(result).toContain('md:px-4');
    expect(result).toContain('lg:px-6');
  });
});
