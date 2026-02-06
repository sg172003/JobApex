import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { Filters as FiltersType } from '@/types';

interface FiltersProps {
  filters: FiltersType;
  onFilterChange: (filters: Partial<FiltersType>) => void;
  onReset: () => void;
  availableSkills: string[];
}

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const workModes = ['Remote', 'Hybrid', 'On-site'];
const dateOptions = [
  { value: 'any', label: 'Any time' },
  { value: '24h', label: 'Last 24 hours' },
  { value: 'week', label: 'Last week' },
  { value: 'month', label: 'Last month' },
];
const matchScoreOptions = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High (>70%)' },
  { value: 'medium', label: 'Medium (40-70%)' },
];

export function Filters({ filters, onFilterChange, onReset, availableSkills }: FiltersProps) {
  const hasActiveFilters = 
    filters.searchTitle ||
    filters.skills.length > 0 ||
    filters.datePosted !== 'any' ||
    filters.jobType.length > 0 ||
    filters.workMode.length > 0 ||
    filters.location ||
    filters.matchScore !== 'all';

  const toggleSkill = (skill: string) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter(s => s !== skill)
      : [...filters.skills, skill];
    onFilterChange({ skills: newSkills });
  };

  const toggleJobType = (type: string) => {
    const newTypes = filters.jobType.includes(type)
      ? filters.jobType.filter(t => t !== type)
      : [...filters.jobType, type];
    onFilterChange({ jobType: newTypes });
  };

  const toggleWorkMode = (mode: string) => {
    const newModes = filters.workMode.includes(mode)
      ? filters.workMode.filter(m => m !== mode)
      : [...filters.workMode, mode];
    onFilterChange({ workMode: newModes });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      {/* Search Title */}
      <div className="space-y-2">
        <Label htmlFor="search">Search Job Title</Label>
        <Input
          id="search"
          placeholder="e.g., Software Engineer"
          value={filters.searchTitle}
          onChange={(e) => onFilterChange({ searchTitle: e.target.value })}
        />
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <Label>Skills</Label>
        <div className="flex flex-wrap gap-2">
          {availableSkills.map((skill) => (
            <Badge
              key={skill}
              variant={filters.skills.includes(skill) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleSkill(skill)}
            >
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      {/* Date Posted */}
      <div className="space-y-2">
        <Label>Date Posted</Label>
        <div className="space-y-2">
          {dateOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`date-${option.value}`}
                name="datePosted"
                checked={filters.datePosted === option.value}
                onChange={() => onFilterChange({ datePosted: option.value as FiltersType['datePosted'] })}
                className="w-4 h-4"
              />
              <Label htmlFor={`date-${option.value}`} className="text-sm font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Job Type */}
      <div className="space-y-2">
        <Label>Job Type</Label>
        <div className="space-y-2">
          {jobTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type}`}
                checked={filters.jobType.includes(type)}
                onCheckedChange={() => toggleJobType(type)}
              />
              <Label htmlFor={`type-${type}`} className="text-sm font-normal cursor-pointer">
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Work Mode */}
      <div className="space-y-2">
        <Label>Work Mode</Label>
        <div className="space-y-2">
          {workModes.map((mode) => (
            <div key={mode} className="flex items-center space-x-2">
              <Checkbox
                id={`mode-${mode}`}
                checked={filters.workMode.includes(mode)}
                onCheckedChange={() => toggleWorkMode(mode)}
              />
              <Label htmlFor={`mode-${mode}`} className="text-sm font-normal cursor-pointer">
                {mode}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="e.g., San Francisco"
          value={filters.location}
          onChange={(e) => onFilterChange({ location: e.target.value })}
        />
      </div>

      {/* Match Score */}
      <div className="space-y-2">
        <Label>Match Score</Label>
        <div className="space-y-2">
          {matchScoreOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`match-${option.value}`}
                name="matchScore"
                checked={filters.matchScore === option.value}
                onChange={() => onFilterChange({ matchScore: option.value as FiltersType['matchScore'] })}
                className="w-4 h-4"
              />
              <Label htmlFor={`match-${option.value}`} className="text-sm font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
