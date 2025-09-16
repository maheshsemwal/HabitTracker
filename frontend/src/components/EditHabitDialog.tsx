import { useState, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { editHabitDialogState, selectedHabitState } from '../store/atoms';
import { useHabits } from '../hooks/useHabits';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const EditHabitDialog = () => {
  const [open, setOpen] = useRecoilState(editHabitDialogState);
  const selectedHabit = useRecoilValue(selectedHabitState);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [category, setCategory] = useState('');
  
  const { updateHabit, loading, setSelectedHabit } = useHabits();

  useEffect(() => {
    if (selectedHabit) {
      setName(selectedHabit.name);
      setDescription(selectedHabit.description || '');
      setFrequency(selectedHabit.frequency);
      setCategory(selectedHabit.category || '');
    }
  }, [selectedHabit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedHabit || !name.trim()) {
      return;
    }

    try {
      await updateHabit(selectedHabit.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        frequency,
        category: category.trim() || undefined,
      });
      
      handleClose();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setFrequency('DAILY');
    setCategory('');
    setSelectedHabit(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
          <DialogDescription>
            Update your habit details.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Drink 8 glasses of water"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency *</Label>
            <Select value={frequency} onValueChange={(value: 'DAILY' | 'WEEKLY' | 'MONTHLY') => setFrequency(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Daily</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Health, Fitness, Learning"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? 'Updating...' : 'Update Habit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditHabitDialog;