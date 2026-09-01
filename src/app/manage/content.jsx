'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import DialogTitle from '@mui/joy/DialogTitle';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import Divider from '@mui/joy/Divider';
import { useAppDispatch, useAppSelector } from '@hooks/use-redux';
import {
  FETCH_CATEGORIES,
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
} from '@redux/slices/categoriesSlice';
import {
  FETCH_CARDS,
  CREATE_CARD,
  UPDATE_CARD,
  DELETE_CARD,
} from '@redux/slices/cardsSlice';
import { StarRating } from '@components';
import styles from './page.module.scss';

export default function ManageContent() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((s) => s.categories.list);
  const cards = useAppSelector((s) => s.cards.list);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [catModal, setCatModal] = useState({ open: false, data: null });
  const [cardModal, setCardModal] = useState({ open: false, data: null });
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    type: null,
    id: null,
  });

  useEffect(() => {
    dispatch(FETCH_CATEGORIES());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCategory) {
      dispatch(FETCH_CARDS({ categoryIds: [selectedCategory] }));
    }
  }, [dispatch, selectedCategory]);

  const filteredCards = cards.filter((c) => c.categoryId === selectedCategory);

  // Category form
  const catForm = useForm({ defaultValues: { name: '' } });

  const openCatModal = (cat = null) => {
    catForm.reset({ name: cat?.name ?? '' });
    setCatModal({ open: true, data: cat });
  };

  const submitCat = catForm.handleSubmit((values) => {
    if (catModal.data) {
      dispatch(UPDATE_CATEGORY({ id: catModal.data.id, name: values.name }));
    } else {
      dispatch(CREATE_CATEGORY({ name: values.name }));
    }
    setCatModal({ open: false, data: null });
  });

  // Card form
  const cardForm = useForm({
    defaultValues: { content: '', stars: 1, categoryId: '' },
  });

  const openCardModal = (card = null) => {
    cardForm.reset({
      content: card?.content ?? '',
      stars: card?.stars ?? 1,
      categoryId: card?.categoryId ?? selectedCategory ?? '',
    });
    setCardModal({ open: true, data: card });
  };

  const submitCard = cardForm.handleSubmit((values) => {
    if (cardModal.data) {
      dispatch(UPDATE_CARD({ id: cardModal.data.id, ...values }));
    } else {
      dispatch(CREATE_CARD(values));
    }
    setCardModal({ open: false, data: null });
  });

  const confirmDelete = () => {
    if (deleteModal.type === 'category') {
      dispatch(DELETE_CATEGORY(deleteModal.id));
      if (selectedCategory === deleteModal.id) setSelectedCategory(null);
    } else {
      dispatch(DELETE_CARD(deleteModal.id));
    }
    setDeleteModal({ open: false, type: null, id: null });
  };

  return (
    <div className={styles.page}>
      {/* Category sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Typography level="title-md">Categories</Typography>
          <Button size="sm" onClick={() => openCatModal()}>
            + New
          </Button>
        </div>
        <ul className={styles.categoryList}>
          {categories.map((cat) => (
            <li
              key={cat.id}
              className={`${styles.categoryItem} ${selectedCategory === cat.id ? styles.selected : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className={styles.categoryName}>{cat.name}</span>
              <span className={styles.categoryCount}>
                {cat._count?.cards ?? 0}
              </span>
              <div className={styles.categoryActions}>
                <IconButton
                  size="sm"
                  variant="plain"
                  onClick={(e) => {
                    e.stopPropagation();
                    openCatModal(cat);
                  }}
                >
                  ✏️
                </IconButton>
                <IconButton
                  size="sm"
                  variant="plain"
                  color="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteModal({
                      open: true,
                      type: 'category',
                      id: cat.id,
                    });
                  }}
                >
                  🗑
                </IconButton>
              </div>
            </li>
          ))}
          {categories.length === 0 && (
            <Typography level="body-sm" color="neutral" sx={{ p: 2 }}>
              No categories yet
            </Typography>
          )}
        </ul>
      </aside>

      {/* Card list */}
      <section className={styles.main}>
        {!selectedCategory ? (
          <div className={styles.empty}>
            <Typography level="body-md" color="neutral">
              Select a category to manage cards
            </Typography>
          </div>
        ) : (
          <>
            <div className={styles.mainHeader}>
              <Typography level="title-md">
                {categories.find((c) => c.id === selectedCategory)?.name}
              </Typography>
              <Button size="sm" onClick={() => openCardModal()}>
                + Add Card
              </Button>
            </div>
            <div className={styles.cardGrid}>
              {filteredCards.map((card) => (
                <div key={card.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <StarRating value={card.stars} readOnly />
                    <div className={styles.cardActions}>
                      <IconButton
                        size="sm"
                        variant="plain"
                        onClick={() => openCardModal(card)}
                      >
                        ✏️
                      </IconButton>
                      <IconButton
                        size="sm"
                        variant="plain"
                        color="danger"
                        onClick={() =>
                          setDeleteModal({
                            open: true,
                            type: 'card',
                            id: card.id,
                          })
                        }
                      >
                        🗑
                      </IconButton>
                    </div>
                  </div>
                  <Typography level="body-md" className={styles.cardContent}>
                    {card.content}
                  </Typography>
                </div>
              ))}
              {filteredCards.length === 0 && (
                <Typography level="body-sm" color="neutral">
                  No cards in this category yet
                </Typography>
              )}
            </div>
          </>
        )}
      </section>

      {/* Category Modal */}
      <Modal
        open={catModal.open}
        onClose={() => setCatModal({ open: false, data: null })}
      >
        <ModalDialog>
          <ModalClose />
          <DialogTitle>
            {catModal.data ? 'Edit Category' : 'New Category'}
          </DialogTitle>
          <Divider />
          <form onSubmit={submitCat} className={styles.form}>
            <Controller
              name="name"
              control={catForm.control}
              rules={{ required: 'Name is required' }}
              render={({ field, fieldState }) => (
                <FormControl error={!!fieldState.error}>
                  <FormLabel>Name</FormLabel>
                  <Input {...field} placeholder="e.g. JavaScript" />
                  {fieldState.error && (
                    <FormHelperText>{fieldState.error.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
            <Button type="submit" fullWidth>
              {catModal.data ? 'Save' : 'Create'}
            </Button>
          </form>
        </ModalDialog>
      </Modal>

      {/* Card Modal */}
      <Modal
        open={cardModal.open}
        onClose={() => setCardModal({ open: false, data: null })}
      >
        <ModalDialog sx={{ minWidth: 400 }}>
          <ModalClose />
          <DialogTitle>{cardModal.data ? 'Edit Card' : 'New Card'}</DialogTitle>
          <Divider />
          <form onSubmit={submitCard} className={styles.form}>
            <Controller
              name="content"
              control={cardForm.control}
              rules={{ required: 'Content is required' }}
              render={({ field, fieldState }) => (
                <FormControl error={!!fieldState.error}>
                  <FormLabel>Content</FormLabel>
                  <Input {...field} placeholder="Write your question..." />
                  {fieldState.error && (
                    <FormHelperText>{fieldState.error.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="categoryId"
              control={cardForm.control}
              rules={{ required: 'Category is required' }}
              render={({ field, fieldState }) => (
                <FormControl error={!!fieldState.error}>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={field.value}
                    onChange={(_, val) => field.onChange(val)}
                    placeholder="Select category"
                  >
                    {categories.map((cat) => (
                      <Option key={cat.id} value={cat.id}>
                        {cat.name}
                      </Option>
                    ))}
                  </Select>
                  {fieldState.error && (
                    <FormHelperText>{fieldState.error.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            <FormControl>
              <FormLabel>Difficulty</FormLabel>
              <Controller
                name="stars"
                control={cardForm.control}
                render={({ field }) => (
                  <StarRating value={field.value} onChange={field.onChange} />
                )}
              />
            </FormControl>

            <Button type="submit" fullWidth>
              {cardModal.data ? 'Save' : 'Create'}
            </Button>
          </form>
        </ModalDialog>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, type: null, id: null })}
      >
        <ModalDialog variant="outlined" role="alertdialog">
          <ModalClose />
          <DialogTitle>Confirm Delete</DialogTitle>
          <Divider />
          <Typography level="body-md">
            Are you sure? This action cannot be undone.
            {deleteModal.type === 'category' &&
              ' All cards in this category will also be deleted.'}
          </Typography>
          <div className={styles.deleteActions}>
            <Button color="danger" onClick={confirmDelete}>
              Delete
            </Button>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() =>
                setDeleteModal({ open: false, type: null, id: null })
              }
            >
              Cancel
            </Button>
          </div>
        </ModalDialog>
      </Modal>
    </div>
  );
}
